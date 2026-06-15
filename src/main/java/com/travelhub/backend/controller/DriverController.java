package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.DriverRequest;
import com.travelhub.backend.dto.response.DriverResponse;
import com.travelhub.backend.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * DriverController manages the staffing endpoints for travel agents.
 * It provides tools for recruiting drivers, managing their professional details, and tracking their availability for trips.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class DriverController {

    private final DriverService driverService;

    /**
     * Constructor injection for driver management business logic.
     */
    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    /**
     * Retrieves all drivers belonging to a specific agent's staff list.
     * Supports optional filtering by system lifecycle status (e.g., 'active', 'suspended').
     */
    @GetMapping("/{agentId}/drivers")
    public ResponseEntity<List<DriverResponse>> getAllDrivers(
            @PathVariable Long agentId,
            @RequestParam(required = false) String lifecycleStatus) {
        return ResponseEntity.ok(driverService.getAllDrivers(agentId, lifecycleStatus));
    }

    /**
     * Retrieves detailed information for a specific driver.
     */
    @GetMapping("/{agentId}/drivers/{driverId}")
    public ResponseEntity<DriverResponse> getDriverById(
            @PathVariable Long agentId,
            @PathVariable Long driverId) {
        return ResponseEntity.ok(driverService.getDriverById(agentId, driverId));
    }

    /**
     * Endpoint for agents to register a new driver into their system.
     * Handles personal, contact, and licensing metadata.
     */
    @PostMapping("/{agentId}/drivers")
    public ResponseEntity<DriverResponse> createDriver(
            @PathVariable Long agentId,
            @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.createDriver(agentId, request));
    }

    /**
     * Endpoint to update the professional profile and contact details of an existing driver.
     */
    @PutMapping("/{agentId}/drivers/{driverId}")
    public ResponseEntity<DriverResponse> updateDriver(
            @PathVariable Long agentId,
            @PathVariable Long driverId,
            @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(agentId, driverId, request));
    }

    /**
     * Endpoint to update the real-time operational status of a driver (e.g., 'Available', 'On Trip').
     */
    @PatchMapping("/{agentId}/drivers/{driverId}/status")
    public ResponseEntity<DriverResponse> updateStatus(
            @PathVariable Long agentId,
            @PathVariable Long driverId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(driverService.updateStatus(agentId, driverId, body.get("status")));
    }

    /**
     * Endpoint to update the system lifecycle status of a driver (e.g., 'Active', 'Suspended', 'Resigned').
     */
    @PatchMapping("/{agentId}/drivers/{driverId}/lifecycle")
    public ResponseEntity<DriverResponse> updateLifecycle(
            @PathVariable Long agentId,
            @PathVariable Long driverId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(driverService.updateLifecycle(agentId, driverId, body.get("lifecycleStatus")));
    }

    /**
     * Endpoint to permanently remove a driver from the agent's staff list.
     */
    @DeleteMapping("/{agentId}/drivers/{driverId}")
    public ResponseEntity<Void> deleteDriver(
            @PathVariable Long agentId,
            @PathVariable Long driverId) {
        driverService.deleteDriver(agentId, driverId);
        return ResponseEntity.noContent().build();
    }
}