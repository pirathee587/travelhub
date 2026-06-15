package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminHotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * AdminHotelController manages the administrative lifecycle and quality control of hotel properties on the platform.
 * It provides tools for auditing new hotel submissions, managing property status, and platform-wide inventory cleanup.
 * Access is strictly restricted to users with the 'ADMIN' role.
 */
@RestController
@RequestMapping("/api/admin/hotels")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final AdminHotelService adminHotelService;

    /**
     * Constructor injection for administrative hospitality business logic.
     */
    public AdminHotelController(AdminHotelService adminHotelService) {
        this.adminHotelService = adminHotelService;
    }

    /**
     * Retrieves the complete list of all hotels registered across the platform.
     */
    @GetMapping
    public ResponseEntity<?> getAllHotels(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService.getAllHotels()));
    }

    /**
     * Retrieves hotels filtered by their platform listing status (e.g., 'Pending', 'Approved').
     */
    @GetMapping("/status")
    public ResponseEntity<?> getHotelsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService.getHotelsByStatus(status)));
    }

    /**
     * Retrieves comprehensive information and property metadata for a specific hotel.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getHotelDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel detail",
                        adminHotelService.getHotelDetail(id)));
    }

    /**
     * Endpoint to approve a pending hotel listing, making it visible to tourists.
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveHotel(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel approved",
                        adminHotelService.approveHotel(id)));
    }

    /**
     * Endpoint to reject a hotel listing application.
     * Optionally accepts a reason for rejection to be communicated to the hotel owner.
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectHotel(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", null) : null;
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel rejected",
                        adminHotelService.rejectHotel(id, reason)));
    }

    /**
     * Endpoint to permanently remove a hotel property from the platform.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(
            @PathVariable Long id) {
        adminHotelService.deleteHotel(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel deleted", null));
    }
}