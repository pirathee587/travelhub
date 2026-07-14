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

    @Transactional
    public RefundResponseDto createRefundRequest(Long userId, Long bookingId, RefundRequestDto dto) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to booking");
        }
        if (!"Paid".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Only bookings with status 'Paid' can be refunded");
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

        booking.setStatus("Refund_Requested");
        bookingRepository.save(booking);

        // Notify Agent via Email
        emailService.sendAgentRefundAlert(saved);

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

        // Upload deposit slip
        String slipUrl = imageUploadService.uploadRoomImage(file).getImageUrl();
        request.setRefundSlipUrl(slipUrl);
        request.setStatus("APPROVED");
        refundRequestRepository.save(request);

        // Update booking status
        Booking booking = request.getBooking();
        booking.setStatus("Refunded");
        bookingRepository.save(booking);

        // Create completed payment record of type Refund
        Payment refundPayment = new Payment();
        refundPayment.setTransactionId("REFUND-" + booking.getId() + "-" + System.currentTimeMillis());
        refundPayment.setBooking(booking);
        refundPayment.setUser(booking.getUser());
        refundPayment.setAgent(agent);
        refundPayment.setType("Refund");
        refundPayment.setAmount(booking.getTotalPrice());
        refundPayment.setStatus("Completed");
        paymentRepository.save(refundPayment);

        // Email tourist
        emailService.sendTouristRefundApproved(request);

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

        // Revert booking status to Paid
        Booking booking = request.getBooking();
        booking.setStatus("Paid");
        bookingRepository.save(booking);

        // Email tourist
        emailService.sendTouristRefundDeclined(request, reason);

        return mapToResponse(request);
    }

    private RefundResponseDto mapToResponse(RefundRequest r) {
        return RefundResponseDto.builder()
                .id(r.getId())
                .bookingId(r.getBooking().getId())
                .packageName(r.getBooking().getPkg() != null ? r.getBooking().getPkg().getPackageName() : "Package")
                .touristName(r.getUser().getName())
                .amount(r.getBooking().getTotalPrice())
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
