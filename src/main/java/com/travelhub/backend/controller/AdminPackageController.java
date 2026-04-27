package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPackageController {

    private final AdminPackageService adminPackageService;

    // GET /api/admin/packages
    @GetMapping
    public ResponseEntity<?> getAllPackages() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Packages found",
                        adminPackageService.getAllPackages()));
    }

    // GET /api/admin/packages/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getPackageById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package found",
                        adminPackageService.getPackageById(id)));
    }

    // PATCH /api/admin/packages/{id}/toggle-active
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> togglePackageActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Package updated",
                        adminPackageService
                                .togglePackageActive(id)));
    }

    // DELETE /api/admin/packages/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(
            @PathVariable Long id) {
        adminPackageService.deletePackage(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Package deleted",
                        null));
    }
}