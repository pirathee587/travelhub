package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    // GET /api/admin/payments/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Payment stats",
                        adminPaymentService.getStats()));
    }

    // GET /api/admin/payments
    // ?type=Payment&status=Completed
    @GetMapping
    public ResponseEntity<?> getAllPayments(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

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

    // GET /api/admin/payments/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Payment found",
                adminPaymentService.getPaymentById(id)));
    }

    // GET /api/admin/payments/booking/{bookingId}
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getByBookingId(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Payments found",
                adminPaymentService.getByBookingId(bookingId)));
    }

    // GET /api/admin/payments/revenue
    @GetMapping("/revenue")
    public ResponseEntity<?> getTotalRevenue() {
        return ResponseEntity.ok(new ApiResponse(
                true, "Total revenue",
                Map.of("totalRevenue", adminPaymentService.getStats().totalRevenue())));
    }

    // GET /api/admin/payments/status?status=Completed
    @GetMapping("/status")
    public ResponseEntity<?> getPaymentsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(new ApiResponse(
                true, "Payments found",
                adminPaymentService.filterByStatus(status)));
    }

    // PATCH /api/admin/payments/{id}/status
    // Body: { "status": "Completed" }
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