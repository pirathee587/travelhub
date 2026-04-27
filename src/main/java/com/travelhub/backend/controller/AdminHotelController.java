package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminHotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final AdminHotelService adminHotelService;

    // ── GET /api/admin/hotels ─────────────────────────
    // All hotels list
    public ResponseEntity<?> getAllHotels(
            @AuthenticationPrincipal
            UserDetails userDetails) {
        // Admin email verify
        // Admin role check already in @PreAuthorize
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService.getAllHotels()));
    }

    // ── GET /api/admin/hotels/status?status=Pending ───
    // Filter by status
    @GetMapping("/status")
    public ResponseEntity<?> getHotelsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService
                                .getHotelsByStatus(status)));
    }

    // ── GET /api/admin/hotels/{id} ────────────────────
    // View Button click → Full detail

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getHotelDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel detail",
                        adminHotelService.getHotelDetail(id)));
    }

    // ── PATCH /api/admin/hotels/{id}/approve ──────────
    // Approve Button click
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveHotel(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel approved",
                        adminHotelService
                                .approveHotel(id)));
    }

    // ── PATCH /api/admin/hotels/{id}/reject ───────────
    // Reject Button click
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectHotel(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel rejected",
                        adminHotelService
                                .rejectHotel(id)));
    }

    // ── DELETE /api/admin/hotels/{id} ─────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(
            @PathVariable Long id) {
        adminHotelService.deleteHotel(id);
        return ResponseEntity.ok(
                new ApiResponse(true,
                        "Hotel deleted", null));
    }
}