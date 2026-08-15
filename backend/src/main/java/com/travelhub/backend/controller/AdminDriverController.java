package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminDriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/drivers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDriverController {

    private final AdminDriverService adminDriverService;

    @GetMapping
    public ResponseEntity<?> getAllDrivers(@RequestParam(required = false) String lifecycleStatus) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Drivers found",
                        adminDriverService.getAllDrivers(lifecycleStatus)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriverDetail(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Driver detail found",
                        adminDriverService.getDriverDetail(id)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveDriver(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Driver approved successfully",
                        adminDriverService.approveDriver(id)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectDriver(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "No reason provided";
        return ResponseEntity.ok(
                new ApiResponse(true, "Driver rejected successfully",
                        adminDriverService.rejectDriver(id, reason)));
    }
}
