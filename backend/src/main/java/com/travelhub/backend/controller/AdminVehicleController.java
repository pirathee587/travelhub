package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vehicles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminVehicleController {

    private final AdminVehicleService adminVehicleService;

    @GetMapping
    public ResponseEntity<?> getAllVehicles(@RequestParam(required = false) String lifecycleStatus) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Vehicles found",
                        adminVehicleService.getAllVehicles(lifecycleStatus)));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingVehicles() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Pending vehicles found",
                        adminVehicleService.getPendingVehicles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleDetail(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Vehicle detail found",
                        adminVehicleService.getVehicleDetail(id)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Vehicle approved successfully",
                        adminVehicleService.approveVehicle(id)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectVehicle(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "No reason provided";
        return ResponseEntity.ok(
                new ApiResponse(true, "Vehicle rejected successfully",
                        adminVehicleService.rejectVehicle(id, reason)));
    }
}
