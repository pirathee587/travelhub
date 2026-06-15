package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * AdminPaymentController manages the administrative financial oversight of the platform.
 * It provides tools for auditing transaction history, tracking revenue, and managing payment lifecycle states.
 * Access is strictly restricted to users with the 'ADMIN' role.
 */
@RestController
@RequestMapping("/api/admin/payments")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    /**
     * Constructor injection for administrative financial business logic.
     */
    public AdminPaymentController(AdminPaymentService adminPaymentService) {
        this.adminPaymentService = adminPaymentService;
    }

    /**
     * Retrieves high-level financial statistics, including total transaction volume and success rates.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Payment stats",
                        adminPaymentService.getStats()));
    }

    /**
     * Retrieves the complete transaction history across the platform.
     * Supports multi-parameter filtering by payment 'type' (e.g., Booking, Cancellation) and 'status'.
     */
    @GetMapping
    public ResponseEntity<?> getAllPayments(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        // Handle complex filtering logic
        if (type != null && status != null
                && !type.equals("All Types")
                && !status.equals("All Status")) {
            return ResponseEntity.ok(new ApiResponse(
                    true, "Payments found",
                    adminPaymentService
                            .filterByTypeAndStatus(
                                    type, status)));
        }
        if (type != null && !type.equals("All Types")) {
            return ResponseEntity.ok(new ApiResponse(
                    true, "Payments found",
                    adminPaymentService.filterByType(type)));
        }
        if (status != null
                && !status.equals("All Status")) {
            return ResponseEntity.ok(new ApiResponse(
                    true, "Payments found",
                    adminPaymentService
                            .filterByStatus(status)));
        }
        return ResponseEntity.ok(new ApiResponse(
                true, "Payments found",
                adminPaymentService.getAllPayments()));
    }

    /**
     * Retrieves the metadata for a single specific payment transaction.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Payment found",
                adminPaymentService.getPaymentById(id)));
    }

    /**
     * Retrieves all payment attempts and records linked to a specific booking.
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getByBookingId(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Payments found",
                adminPaymentService.getByBookingId(bookingId)));
    }

    /**
     * Retrieves the calculated total platform revenue.
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getTotalRevenue() {
        return ResponseEntity.ok(new ApiResponse(
                true, "Total revenue",
                Map.of("totalRevenue", adminPaymentService.getStats().totalRevenue())));
    }

    /**
     * Retrieves payments filtered specifically by their current state (e.g., 'COMPLETED', 'FAILED').
     */
    @GetMapping("/status")
    public ResponseEntity<?> getPaymentsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Payments found",
                adminPaymentService.filterByStatus(status)));
    }

    /**
     * Endpoint to manually update or override the status of a payment record.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Status updated",
                adminPaymentService.updateStatus(
                        id, body.get("status"))));
    }
}