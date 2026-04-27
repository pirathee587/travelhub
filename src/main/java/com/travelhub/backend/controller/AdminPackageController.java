package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost
        .PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPackageController {

    private final AdminPackageService
            adminPackageService;

    // ── GET /api/admin/packages ───────────────────────
    // All packages list
    @GetMapping
    public ResponseEntity<?> getAllPackages() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService
                                .getAllPackages()));
    }

    // ── GET /api/admin/packages/status?status=Pending ─
    // Filter by status
    @GetMapping("/status")
    public ResponseEntity<?> getByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService
                                .getByStatus(status)));
    }

    // ── GET /api/admin/packages/{id} ─────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getPackageDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package detail",
                        adminPackageService
                                .getPackageDetail(id)));
    }

    // ── PATCH /api/admin/packages/{id}/approve ────────
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approvePackage(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package approved",
                        adminPackageService
                                .approvePackage(id)));
    }

    // ── PATCH /api/admin/packages/{id}/reject ─────────
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectPackage(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package rejected",
                        adminPackageService
                                .rejectPackage(id)));
    }

    // ── PATCH /api/admin/packages/{id}/toggle-active ──
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package updated",
                        adminPackageService
                                .toggleActive(id)));
    }

    // ── DELETE /api/admin/packages/{id} ───────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(
            @PathVariable Long id) {
        adminPackageService.deletePackage(id);
        return ResponseEntity.ok(
                new ApiResponse(true,
                        "Package deleted", null));
    }
}