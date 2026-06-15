package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminPaymentResponse;
import com.travelhub.backend.dto.response.AdminPaymentStatsResponse;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * AdminPaymentService provides administrative oversight for all financial transactions on the platform.
 * It manages payment tracking, refund monitoring, and aggregate revenue statistics.
 */
@Service
public class AdminPaymentService {

    private final PaymentRepository paymentRepository;

    /**
     * Constructor injection for payment data access.
     */
    public AdminPaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Aggregates global financial metrics for the administrative dashboard.
     * Includes total historical revenue, current pending amounts, and total refunds processed.
     */
    public AdminPaymentStatsResponse getStats() {
        // Fetch aggregated values from specialized repository queries
        Double totalRevenue = paymentRepository.getTotalRevenue();
        Double pendingAmount = paymentRepository.getPendingAmount();
        Long pendingCount = paymentRepository.countByStatus("Pending");
        Double totalRefunds = paymentRepository.getTotalRefunds();

        // Map to response DTO with graceful null handling
        return new AdminPaymentStatsResponse(
                totalRevenue  != null ? totalRevenue  : 0.0,
                pendingAmount != null ? pendingAmount : 0.0,
                pendingCount  != null ? pendingCount  : 0L,
                totalRefunds  != null ? totalRefunds  : 0.0
        );
    }

    /**
     * Retrieves all historical financial transactions registered in the system.
     */
    public List<AdminPaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Retrieves a single payment record by its unique ID.
     */
    public AdminPaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToResponse(payment);
    }

    /**
     * Filters transactions by their fundamental type (e.g., "Payment", "Refund").
     */
    public List<AdminPaymentResponse> filterByType(String type) {
        return paymentRepository.findByType(type)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Filters transactions by their current processing status (e.g., "Completed", "Pending").
     */
    public List<AdminPaymentResponse> filterByStatus(String status) {
        return paymentRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Highly specific filtering by both transaction type and processing status.
     */
    public List<AdminPaymentResponse> filterByTypeAndStatus(String type, String status) {
        return paymentRepository
                .findByTypeAndStatus(type, status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Retrieves all financial events associated with a specific travel booking.
     */
    public List<AdminPaymentResponse> getByBookingId(Long bookingId) {
        return paymentRepository
                .findByBookingId(bookingId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Manually updates the status of a payment.
     * Includes validation to ensure the new status is within the permitted state machine.
     */
    public AdminPaymentResponse updateStatus(Long id, String status) {
        List<String> valid = List.of("Completed", "Pending");

        if (!valid.contains(status))
            throw new BadRequestException("Invalid status: " + status + ". Must be Completed or Pending");

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        
        payment.setStatus(status);
        return mapToResponse(paymentRepository.save(payment));
    }

    /**
     * Maps a Payment entity to a detailed AdminPaymentResponse DTO.
     * Resolves related entities like Booking, User (Tourist), and Agent for a comprehensive view.
     */
    private AdminPaymentResponse mapToResponse(Payment p) {
        return new AdminPaymentResponse(
                p.getId(),
                p.getTransactionId(), // Internal transaction identifier
                // Map booking reference with user-friendly formatting
                p.getBooking() != null ? String.format("BK-%d", p.getBooking().getId()) : "",
                // Extract and format transaction date
                p.getCreatedAt() != null ? p.getCreatedAt().toLocalDate().toString() : "",
                // Resolve tourist name
                p.getUser() != null ? p.getUser().getName() : "",
                // Resolve agent or service provider name
                p.getAgent() != null ? p.getAgent().getUser().getName() : "",
                p.getType(),
                p.getAmount(),
                p.getStatus()
        );
    }
}