package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminPackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * AdminPackageController manages the administrative lifecycle and quality control of travel packages.
 * It provides tools for auditing agent submissions, managing product availability, and platform-wide inventory cleanup.
 * Access is strictly restricted to users with the 'ADMIN' role.
 */
@RestController
@RequestMapping("/api/admin/packages")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPackageController {

    private final AdminPackageService adminPackageService;

    /**
     * Constructor injection for administrative package business logic.
     */
    public AdminPackageController(AdminPackageService adminPackageService) {
        this.adminPackageService = adminPackageService;
    }

    /**
     * Retrieves the complete list of all travel packages registered across the platform.
     */
    @GetMapping
    public ResponseEntity<?> getAllPackages() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService.getAllPackages()));
    }

    /**
     * Retrieves travel packages filtered by their platform listing status (e.g., 'Pending', 'Approved').
     */
    @GetMapping("/status")
    public ResponseEntity<?> getByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService.getByStatus(status)));
    }

    /**
     * Retrieves comprehensive information and itinerary metadata for a specific travel package.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPackageDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package detail",
                        adminPackageService.getPackageDetail(id)));
    }

    /**
     * Endpoint to approve a pending travel package listing, making it visible for booking.
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approvePackage(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package approved",
                        adminPackageService.approvePackage(id)));
    }

    /**
     * Endpoint to reject a travel package listing application.
     * Optionally accepts a reason for rejection to be communicated to the agent.
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectPackage(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", null) : null;
        return ResponseEntity.ok(
                new ApiResponse(true, "Package rejected",
                        adminPackageService.rejectPackage(id, reason)));
    }

    /**
     * Toggles the visibility/active status of a package without deleting it.
     */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package updated",
                        adminPackageService.toggleActive(id)));
    }

    /**
     * Endpoint to permanently remove a travel package from the platform.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(
            @PathVariable Long id) {
        adminPackageService.deletePackage(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Package deleted", null));
    }
}