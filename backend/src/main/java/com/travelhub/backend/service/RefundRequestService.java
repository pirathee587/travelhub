package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.RefundRequestDto;
import com.travelhub.backend.dto.response.RefundResponseDto;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PaymentRepository;
import com.travelhub.backend.repository.RefundRequestRepository;
import com.travelhub.backend.repository.AgentSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundRequestService {

    private final RefundRequestRepository refundRequestRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AgentRepository agentRepository;
    private final ImageUploadService imageUploadService;
    private final EmailService emailService;
    private final AgentSettingsRepository agentSettingsRepository;
    private final AgentNotificationService agentNotificationService;
    private final UserNotificationService userNotificationService;
    private final WalletService walletService;

    @Transactional
    public RefundResponseDto createRefundRequest(Long userId, Long bookingId, RefundRequestDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to booking");
        }
        if ("completed".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Refund requests cannot be submitted for completed trips");
        }
        if ("cancelled".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Refund requests cannot be submitted for cancelled trips");
        }
        boolean isPaid = "PAID".equalsIgnoreCase(booking.getPaymentStatus()) || "Paid".equalsIgnoreCase(booking.getStatus());
        if (!isPaid) {
            throw new BadRequestException("Only paid bookings can be refunded");
        }
        if (refundRequestRepository.findByBookingId(bookingId).isPresent()) {
            throw new BadRequestException("A refund request already exists for this booking");
        }

        Agent agent = booking.getPkg() != null ? booking.getPkg().getAgent() : null;
        if (agent == null) {
            throw new BadRequestException("No package agent associated with this booking");
        }

        RefundRequest request = RefundRequest.builder()
                .booking(booking)
                .user(booking.getUser())
                .agent(agent)
                .bankName(dto.getBankName())
                .accountNo(dto.getAccountNo())
                .accountHolderName(dto.getAccountHolderName())
                .branchName(dto.getBranchName())
                .reason(dto.getReason())
                .status("PENDING")
                .build();

        RefundRequest saved = refundRequestRepository.save(request);

        booking.setPaymentStatus("REFUND_REQUESTED");
        booking.setStatus("Refund_Requested");
        bookingRepository.save(booking);

        // Notify Agent via Email & In-App
        if (saved.getAgent() != null) {
            boolean notifyCancellation = agentSettingsRepository.findByAgentId(saved.getAgent().getId())
                    .map(AgentSettings::getNotifyCancellation)
                    .orElse(true);
            if (notifyCancellation) {
                emailService.sendAgentRefundAlert(saved);
                agentNotificationService.createNotification(saved.getAgent(), "refund", "New Refund Request", "Tourist " + booking.getUser().getName() + " requested a refund for booking #" + booking.getId() + ".");
            }
        }
        userNotificationService.notifyUser(userId, "refund", "Refund Requested", "Your refund request for booking #" + booking.getId() + " was submitted successfully.", "/tourist/trips");

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RefundResponseDto> getTouristRefundRequests(Long userId) {
        return refundRequestRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RefundResponseDto> getAgentRefundRequests(Long agentOwnerUserId) {
        Agent agent = agentRepository.findByOwnerId(agentOwnerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentOwnerUserId));
        return refundRequestRepository.findByAgentId(agent.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public RefundResponseDto approveRefundRequest(Long agentOwnerUserId, Long requestId, MultipartFile file) {
        Agent agent = agentRepository.findByOwnerId(agentOwnerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentOwnerUserId));

        RefundRequest request = refundRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RefundRequest", "id", requestId));

        if (!request.getAgent().getId().equals(agent.getId())) {
            throw new BadRequestException("Unauthorized access to this refund request");
        }
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("This refund request is already processed");
        }

        Booking booking = request.getBooking();
        AgentSettings settings = agentSettingsRepository.findByAgentId(agent.getId()).orElse(null);
        int freeDays = (settings != null && settings.getFreeCancellationDays() != null) ? settings.getFreeCancellationDays() : 2;
        double feePercent = (settings != null && settings.getCancellationFeePercent() != null) ? settings.getCancellationFeePercent() : 10.0;

        double totalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
        double feeAmount = 0.0;

        if (booking.getStartDate() != null) {
            java.time.LocalDate deadline = booking.getStartDate().minusDays(freeDays);
            if (java.time.LocalDate.now().isAfter(deadline)) {
                feeAmount = Math.round(totalAmount * (feePercent / 100.0) * 100.0) / 100.0;
            }
        }
        double netRefund = Math.max(0.0, totalAmount - feeAmount);

        // Upload deposit slip
        String slipUrl = imageUploadService.uploadRoomImage(file).getImageUrl();
        request.setRefundSlipUrl(slipUrl);
        request.setCancellationFee(feeAmount);
        request.setNetRefundAmount(netRefund);
        request.setStatus("APPROVED");
        refundRequestRepository.save(request);

        // Update booking status
        booking.setPaymentStatus("REFUNDED");
        booking.setStatus("cancelled");
        bookingRepository.save(booking);

        // Process Shared Late Cancellation Fee Split (80% Agency, 20% Platform)
        walletService.handleLateCancellationSplit(booking, feeAmount);

        // Create completed payment record of type Refund
        Payment refundPayment = new Payment();
        refundPayment.setTransactionId("REFUND-" + booking.getId() + "-" + System.currentTimeMillis());
        refundPayment.setBooking(booking);
        refundPayment.setUser(booking.getUser());
        refundPayment.setAgent(agent);
        refundPayment.setType("Refund");
        refundPayment.setAmount(netRefund);
        refundPayment.setStatus("Completed");
        paymentRepository.save(refundPayment);

        // Email & In-App notify tourist & agent
        emailService.sendTouristRefundApproved(request);
        userNotificationService.notifyUser(booking.getUser().getId(), "refund", "Refund Approved", "Your refund of $" + netRefund + " for booking #" + booking.getId() + " was approved.", "/tourist/trips");
        agentNotificationService.createNotification(agent, "refund", "Refund Approved", "You approved a refund of $" + netRefund + " for booking #" + booking.getId() + ".");

        return mapToResponse(request);
    }

    @Transactional
    public RefundResponseDto declineRefundRequest(Long agentOwnerUserId, Long requestId, String reason) {
        Agent agent = agentRepository.findByOwnerId(agentOwnerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentOwnerUserId));

        RefundRequest request = refundRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RefundRequest", "id", requestId));

        if (!request.getAgent().getId().equals(agent.getId())) {
            throw new BadRequestException("Unauthorized access to this refund request");
        }
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("This refund request is already processed");
        }

        request.setStatus("REJECTED");
        request.setReason(reason);
        refundRequestRepository.save(request);

        // Revert booking payment status to PAID
        Booking booking = request.getBooking();
        booking.setPaymentStatus("PAID");
        booking.setStatus("confirmed");
        bookingRepository.save(booking);

        // Email & In-App notify tourist
        emailService.sendTouristRefundDeclined(request, reason);
        userNotificationService.notifyUser(booking.getUser().getId(), "refund", "Refund Declined", "Your refund request for booking #" + booking.getId() + " was declined. Reason: " + reason, "/tourist/trips");

        return mapToResponse(request);
    }

    private RefundResponseDto mapToResponse(RefundRequest r) {
        return RefundResponseDto.builder()
                .id(r.getId())
                .bookingId(r.getBooking().getId())
                .packageName(r.getBooking().getPkg() != null ? r.getBooking().getPkg().getPackageName() : "Package")
                .touristName(r.getUser().getName())
                .amount(r.getBooking().getTotalPrice())
                .cancellationFee(r.getCancellationFee())
                .netRefundAmount(r.getNetRefundAmount())
                .bankName(r.getBankName())
                .accountNo(r.getAccountNo())
                .accountHolderName(r.getAccountHolderName())
                .branchName(r.getBranchName())
                .reason(r.getReason())
                .status(r.getStatus())
                .refundSlipUrl(r.getRefundSlipUrl())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
