package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminPackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/packages")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPackageController {

    private final AdminPackageService adminPackageService;
    public AdminPackageController(AdminPackageService adminPackageService) {
        this.adminPackageService = adminPackageService;
    }


    @GetMapping
    public ResponseEntity<?> getAllPackages() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService.getAllPackages()));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService.getByStatus(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPackageDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package detail",
                        adminPackageService.getPackageDetail(id)));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approvePackage(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package approved",
                        adminPackageService.approvePackage(id)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectPackage(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", null) : null;
        return ResponseEntity.ok(
                new ApiResponse(true, "Package rejected",
                        adminPackageService.rejectPackage(id, reason)));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package updated",
                        adminPackageService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(
            @PathVariable Long id) {
        adminPackageService.deletePackage(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Package deleted", null));
    }
}