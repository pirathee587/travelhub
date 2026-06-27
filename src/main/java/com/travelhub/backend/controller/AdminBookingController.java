package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    // GET /api/admin/bookings
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Bookings found",
                        adminBookingService.getAllBookings()));
    }

    // GET /api/admin/bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Booking found",
                        adminBookingService.getBookingById(id)));
    }

    // GET /api/admin/bookings/status?status=pending
    @GetMapping("/status")
    public ResponseEntity<?> getBookingsByStatus(@RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Bookings found",
                        adminBookingService.getBookingsByStatus(status)));
    }

    // PATCH /api/admin/bookings/{id}/status
    // Body: { "status": "confirmed" }
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Status updated",
                        adminBookingService.updateStatus(id, body.get("status"))));
    }
}
