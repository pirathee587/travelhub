package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminPaymentResponse;
import com.travelhub.backend.dto.response.AdminPaymentStatsResponse;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;

    // ── Get Stats ─────────────────────────────────────
    // Total Revenue, Pending, Refunds
    public AdminPaymentStatsResponse getStats() {

        Double totalRevenue =
                paymentRepository.getTotalRevenue();
        Double pendingAmount =
                paymentRepository.getPendingAmount();
        Long pendingCount =
                paymentRepository.countByStatus("Pending");
        Double totalRefunds =
                paymentRepository.getTotalRefunds();

        return new AdminPaymentStatsResponse(
                totalRevenue  != null ? totalRevenue  : 0.0,
                pendingAmount != null ? pendingAmount : 0.0,
                pendingCount  != null ? pendingCount  : 0L,
                totalRefunds  != null ? totalRefunds  : 0.0
        );
    }

    // ── Get All Payments ──────────────────────────────
    public List<AdminPaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Payment By ID ─────────────────────────────
    public AdminPaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment", "id", id));
        return mapToResponse(payment);
    }

    // ── Filter By Type ────────────────────────────────
    // type = Payment or Refund
    public List<AdminPaymentResponse> filterByType(
            String type) {
        return paymentRepository.findByType(type)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Filter By Status ──────────────────────────────
    // status = Completed or Pending
    public List<AdminPaymentResponse> filterByStatus(
            String status) {
        return paymentRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Filter By Type + Status ───────────────────────
    public List<AdminPaymentResponse> filterByTypeAndStatus(
            String type, String status) {
        return paymentRepository
                .findByTypeAndStatus(type, status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Payments By Booking ───────────────────────
    public List<AdminPaymentResponse> getByBookingId(
            Long bookingId) {
        return paymentRepository
                .findByBookingId(bookingId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Update Payment Status ─────────────────────────
    @Transactional
    public AdminPaymentResponse updateStatus(
            Long id, String status) {

        List<String> valid = List.of(
                "Completed", "Pending");

        if (!valid.contains(status))
            throw new BadRequestException(
                    "Invalid status: " + status +
                            ". Must be Completed or Pending");

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment", "id", id));
        payment.setStatus(status);
        return mapToResponse(paymentRepository.save(payment));
    }

    // ── Map Entity → Response ─────────────────────────
    private AdminPaymentResponse mapToResponse(Payment p) {
        return new AdminPaymentResponse(
                p.getId(),

                // TXN-001 format
                p.getTransactionId(),

                // BK-2024-001 format
                p.getBooking() != null
                        ? String.format("BK-%d",
                        p.getBooking().getId())
                        : "",

                // Booking date
                p.getCreatedAt() != null
                        ? p.getCreatedAt()
                        .toLocalDate().toString()
                        : "",

                // Tourist name
                p.getUser() != null
                        ? p.getUser().getName()
                        : "",

                // Agent/Company name
                // உதாரணம்: Pinnacle Tours
                p.getAgent() != null
                        ? p.getAgent().getAgencyName()
                        : "",

                // Payment or Refund
                p.getType(),

                p.getAmount(),

                // Completed or Pending
                p.getStatus()
        );
    }
}
