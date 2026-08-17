package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.PayoutRequestDto;
import com.travelhub.backend.dto.response.*;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    public static final double PLATFORM_COMMISSION_PERCENT = 5.0; // 5% Platform Commission
    public static final double AGENCY_CANCELLATION_FEE_SHARE = 0.80; // 80% to Agency
    public static final double PLATFORM_CANCELLATION_FEE_SHARE = 0.20; // 20% to Platform Admin

    private final AgentWalletRepository agentWalletRepository;
    private final PayoutRequestRepository payoutRequestRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AgentRepository agentRepository;
    private final ImageUploadService imageUploadService;

    @Transactional
    public AgentWallet getOrCreateWallet(Agent agent) {
        return agentWalletRepository.findByAgentId(agent.getId())
                .orElseGet(() -> agentWalletRepository.save(AgentWallet.builder()
                        .agent(agent)
                        .availableBalance(0.0)
                        .pendingEscrowBalance(0.0)
                        .totalWithdrawn(0.0)
                        .build()));
    }

    @Transactional(readOnly = true)
    public WalletResponseDto getAgencyWalletResponse(Long agentUserId) {
        Agent agent = agentRepository.findByOwnerId(agentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentUserId));
        AgentWallet wallet = getOrCreateWallet(agent);
        List<WalletTransactionDto> txns = walletTransactionRepository.findByAgentIdOrderByCreatedAtDesc(agent.getId())
                .stream()
                .map(this::mapToTransactionDto)
                .toList();

        return WalletResponseDto.builder()
                .agentId(agent.getId())
                .agencyName(agent.getAgencyName())
                .availableBalance(Math.round(wallet.getAvailableBalance() * 100.0) / 100.0)
                .pendingEscrowBalance(Math.round(wallet.getPendingEscrowBalance() * 100.0) / 100.0)
                .totalWithdrawn(Math.round(wallet.getTotalWithdrawn() * 100.0) / 100.0)
                .platformCommissionRate(PLATFORM_COMMISSION_PERCENT)
                .recentTransactions(txns)
                .build();
    }

    @Transactional
    public void recordBookingPaymentEscrow(Booking booking) {
        if (booking == null || booking.getPkg() == null || booking.getPkg().getAgent() == null) return;
        Agent agent = booking.getPkg().getAgent();
        AgentWallet wallet = getOrCreateWallet(agent);

        double totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
        double netEscrow = Math.round(totalPrice * (1.0 - (PLATFORM_COMMISSION_PERCENT / 100.0)) * 100.0) / 100.0;

        wallet.setPendingEscrowBalance(wallet.getPendingEscrowBalance() + netEscrow);
        agentWalletRepository.save(wallet);

        // Record pending escrow transaction entry
        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(agent)
                .booking(booking)
                .type("ESCROW_HELD")
                .amount(netEscrow)
                .description("Held in escrow for Booking #" + booking.getId() + " (" + booking.getPkg().getPackageName() + ")")
                .build());
    }

    @Transactional
    public void releaseTripEscrowToWallet(Booking booking) {
        if (booking == null || booking.getPkg() == null || booking.getPkg().getAgent() == null) return;
        Agent agent = booking.getPkg().getAgent();
        AgentWallet wallet = getOrCreateWallet(agent);

        double totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
        double commissionAmount = Math.round(totalPrice * (PLATFORM_COMMISSION_PERCENT / 100.0) * 100.0) / 100.0;
        double netEarnings = Math.round((totalPrice - commissionAmount) * 100.0) / 100.0;

        // Deduct from pending escrow and release to available balance
        double currentEscrow = wallet.getPendingEscrowBalance();
        wallet.setPendingEscrowBalance(Math.max(0.0, currentEscrow - netEarnings));
        wallet.setAvailableBalance(wallet.getAvailableBalance() + netEarnings);
        agentWalletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(agent)
                .booking(booking)
                .type("TRIP_COMPLETED_CREDIT")
                .amount(netEarnings)
                .description("Net payout (95%) for completed Booking #" + booking.getId() + " - " + booking.getPkg().getPackageName())
                .build());

        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(agent)
                .booking(booking)
                .type("COMMISSION_DEDUCTION")
                .amount(commissionAmount)
                .description("Platform 5% Commission fee for Booking #" + booking.getId())
                .build());
    }

    @Transactional
    public void handleLateCancellationSplit(Booking booking, Double cancellationFee) {
        if (booking == null || booking.getPkg() == null || booking.getPkg().getAgent() == null) return;
        if (cancellationFee == null || cancellationFee <= 0) return;

        Agent agent = booking.getPkg().getAgent();
        AgentWallet wallet = getOrCreateWallet(agent);

        // Remove from pending escrow if present
        double totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
        double netEscrow = Math.round(totalPrice * (1.0 - (PLATFORM_COMMISSION_PERCENT / 100.0)) * 100.0) / 100.0;
        wallet.setPendingEscrowBalance(Math.max(0.0, wallet.getPendingEscrowBalance() - netEscrow));

        // Shared Fee Option 2: 80% to Agency, 20% to Platform Admin
        double agencyCompensation = Math.round(cancellationFee * AGENCY_CANCELLATION_FEE_SHARE * 100.0) / 100.0;

        wallet.setAvailableBalance(wallet.getAvailableBalance() + agencyCompensation);
        agentWalletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(agent)
                .booking(booking)
                .type("CANCELLATION_COMPENSATION")
                .amount(agencyCompensation)
                .description("Agency 80% share of late cancellation fee for Booking #" + booking.getId())
                .build());
    }

    @Transactional
    public PayoutResponseDto requestPayout(Long agentUserId, PayoutRequestDto dto) {
        Agent agent = agentRepository.findByOwnerId(agentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentUserId));
        AgentWallet wallet = getOrCreateWallet(agent);

        if (dto.getAmount() > wallet.getAvailableBalance()) {
            throw new BadRequestException("Requested payout amount ($" + dto.getAmount() + ") exceeds available wallet balance ($" + wallet.getAvailableBalance() + ")");
        }

        wallet.setAvailableBalance(wallet.getAvailableBalance() - dto.getAmount());
        agentWalletRepository.save(wallet);

        PayoutRequest request = PayoutRequest.builder()
                .agent(agent)
                .amount(dto.getAmount())
                .bankName(dto.getBankName())
                .accountNo(dto.getAccountNo())
                .accountHolderName(dto.getAccountHolderName())
                .branchName(dto.getBranchName())
                .status("PENDING")
                .build();
        PayoutRequest saved = payoutRequestRepository.save(request);

        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(agent)
                .type("PAYOUT_WITHDRAWAL_REQUEST")
                .amount(-dto.getAmount())
                .description("Payout request #" + saved.getId() + " submitted to " + dto.getBankName() + " (" + dto.getAccountNo() + ")")
                .build());

        return mapToPayoutResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PayoutResponseDto> getAgencyPayoutRequests(Long agentUserId) {
        Agent agent = agentRepository.findByOwnerId(agentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentUserId));
        return payoutRequestRepository.findByAgentIdOrderByCreatedAtDesc(agent.getId())
                .stream()
                .map(this::mapToPayoutResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PayoutResponseDto> getAllPayoutRequests(String status) {
        List<PayoutRequest> list;
        if (status != null && !status.isBlank()) {
            list = payoutRequestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            list = payoutRequestRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToPayoutResponse).toList();
    }

    @Transactional
    public PayoutResponseDto approvePayout(Long payoutId, MultipartFile slipFile) {
        PayoutRequest request = payoutRequestRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("PayoutRequest", "id", payoutId));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Payout request #" + payoutId + " is already processed");
        }

        if (slipFile != null && !slipFile.isEmpty()) {
            String slipUrl = imageUploadService.uploadRoomImage(slipFile).getImageUrl();
            request.setTransferSlipUrl(slipUrl);
        }

        request.setStatus("APPROVED");
        request.setProcessedAt(LocalDateTime.now());
        payoutRequestRepository.save(request);

        // Update wallet totalWithdrawn
        AgentWallet wallet = getOrCreateWallet(request.getAgent());
        wallet.setTotalWithdrawn(wallet.getTotalWithdrawn() + request.getAmount());
        agentWalletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(request.getAgent())
                .type("PAYOUT_APPROVED")
                .amount(request.getAmount())
                .description("Payout #" + request.getId() + " approved and transferred to bank account")
                .build());

        return mapToPayoutResponse(request);
    }

    @Transactional
    public PayoutResponseDto rejectPayout(Long payoutId, String reason) {
        PayoutRequest request = payoutRequestRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("PayoutRequest", "id", payoutId));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Payout request #" + payoutId + " is already processed");
        }

        request.setStatus("REJECTED");
        request.setRejectionReason(reason);
        request.setProcessedAt(LocalDateTime.now());
        payoutRequestRepository.save(request);

        // Refund amount back to Available Balance
        AgentWallet wallet = getOrCreateWallet(request.getAgent());
        wallet.setAvailableBalance(wallet.getAvailableBalance() + request.getAmount());
        agentWalletRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
                .agent(request.getAgent())
                .type("PAYOUT_REJECTED_REFUND")
                .amount(request.getAmount())
                .description("Refund of rejected payout request #" + request.getId() + ". Reason: " + reason)
                .build());

        return mapToPayoutResponse(request);
    }

    @Transactional(readOnly = true)
    public AdminFinanceStatsResponse getAdminFinanceStats() {
        List<WalletTransaction> allTxns = walletTransactionRepository.findAll();

        double totalCompletedTripsVolume = allTxns.stream()
                .filter(t -> "TRIP_COMPLETED_CREDIT".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> (t.getAmount() != null ? t.getAmount() : 0.0) / (1.0 - (PLATFORM_COMMISSION_PERCENT / 100.0)))
                .sum();

        double totalPlatformCommission = allTxns.stream()
                .filter(t -> "COMMISSION_DEDUCTION".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalCancellationCompensation = allTxns.stream()
                .filter(t -> "CANCELLATION_COMPENSATION".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        // Platform cancellation fee share = Agency compensation / 4 (since 80% agency, 20% platform)
        double totalPlatformCancellationFees = Math.round((totalCancellationCompensation / 4.0) * 100.0) / 100.0;

        double totalPendingEscrow = agentWalletRepository.findAll().stream()
                .mapToDouble(w -> w.getPendingEscrowBalance() != null ? w.getPendingEscrowBalance() : 0.0)
                .sum();

        double totalPayoutsCompleted = payoutRequestRepository.findAll().stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        long pendingCount = payoutRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING").size();

        return AdminFinanceStatsResponse.builder()
                .totalGrossMarketplaceVolume(Math.round(totalCompletedTripsVolume * 100.0) / 100.0)
                .totalPlatformCommissionRevenue(Math.round(totalPlatformCommission * 100.0) / 100.0)
                .totalPlatformCancellationFees(totalPlatformCancellationFees)
                .totalPlatformNetRevenue(Math.round((totalPlatformCommission + totalPlatformCancellationFees) * 100.0) / 100.0)
                .totalPendingAgencyEscrow(Math.round(totalPendingEscrow * 100.0) / 100.0)
                .totalAgencyPayoutsCompleted(Math.round(totalPayoutsCompleted * 100.0) / 100.0)
                .pendingPayoutRequestsCount(pendingCount)
                .build();
    }

    private WalletTransactionDto mapToTransactionDto(WalletTransaction t) {
        return WalletTransactionDto.builder()
                .id(t.getId())
                .bookingId(t.getBooking() != null ? t.getBooking().getId() : null)
                .type(t.getType())
                .amount(t.getAmount())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private PayoutResponseDto mapToPayoutResponse(PayoutRequest p) {
        return PayoutResponseDto.builder()
                .id(p.getId())
                .agentId(p.getAgent().getId())
                .agencyName(p.getAgent().getAgencyName())
                .amount(p.getAmount())
                .bankName(p.getBankName())
                .accountNo(p.getAccountNo())
                .accountHolderName(p.getAccountHolderName())
                .branchName(p.getBranchName())
                .status(p.getStatus())
                .rejectionReason(p.getRejectionReason())
                .transferSlipUrl(p.getTransferSlipUrl())
                .processedAt(p.getProcessedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
