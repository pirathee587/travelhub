package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminHotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/hotels")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final AdminHotelService adminHotelService;
    public AdminHotelController(AdminHotelService adminHotelService) {
        this.adminHotelService = adminHotelService;
    }


    @GetMapping
    public ResponseEntity<?> getAllHotels(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService.getAllHotels()));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getHotelsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService.getHotelsByStatus(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getHotelDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel detail",
                        adminHotelService.getHotelDetail(id)));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveHotel(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel approved",
                        adminHotelService.approveHotel(id)));
    }

    // ── PATCH /api/admin/hotels/{id}/reject ───────────
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectHotel(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", null) : null;
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel rejected",
                        adminHotelService.rejectHotel(id, reason)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(
            @PathVariable Long id) {
        adminHotelService.deleteHotel(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel deleted", null));
    }
}