package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.DriverRequest;
import com.travelhub.backend.dto.response.DriverResponse;
import com.travelhub.backend.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agent")
public class DriverController {

    private final DriverService driverService;
    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }


    @GetMapping("/{agentId}/drivers")
    public ResponseEntity<List<DriverResponse>> getAllDrivers(
            @PathVariable Long agentId,
            @RequestParam(required = false) String lifecycleStatus) {
        return ResponseEntity.ok(driverService.getAllDrivers(agentId, lifecycleStatus));
    }

    @GetMapping("/{agentId}/drivers/{driverId}")
    public ResponseEntity<DriverResponse> getDriverById(
            @PathVariable Long agentId,
            @PathVariable Long driverId) {
        return ResponseEntity.ok(driverService.getDriverById(agentId, driverId));
    }

    @PostMapping("/{agentId}/drivers")
    public ResponseEntity<DriverResponse> createDriver(
            @PathVariable Long agentId,
            @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.createDriver(agentId, request));
    }

    @PutMapping("/{agentId}/drivers/{driverId}")
    public ResponseEntity<DriverResponse> updateDriver(
            @PathVariable Long agentId,
            @PathVariable Long driverId,
            @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(agentId, driverId, request));
    }

    @PatchMapping("/{agentId}/drivers/{driverId}/status")
    public ResponseEntity<DriverResponse> updateStatus(
            @PathVariable Long agentId,
            @PathVariable Long driverId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(driverService.updateStatus(agentId, driverId, body.get("status")));
    }

    @PatchMapping("/{agentId}/drivers/{driverId}/lifecycle")
    public ResponseEntity<DriverResponse> updateLifecycle(
            @PathVariable Long agentId,
            @PathVariable Long driverId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(driverService.updateLifecycle(agentId, driverId, body.get("lifecycleStatus")));
    }

    @DeleteMapping("/{agentId}/drivers/{driverId}")
    public ResponseEntity<Void> deleteDriver(
            @PathVariable Long agentId,
            @PathVariable Long driverId) {
        driverService.deleteDriver(agentId, driverId);
        return ResponseEntity.noContent().build();
    }
}