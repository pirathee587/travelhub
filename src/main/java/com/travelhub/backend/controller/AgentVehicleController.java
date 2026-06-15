package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.VehicleRequest;
import com.travelhub.backend.dto.response.VehicleResponse;
import com.travelhub.backend.service.AgentVehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * AgentVehicleController manages the transport fleet for travel agents.
 * It provides endpoints for vehicle registration, real-time status tracking, and fleet inventory management.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentVehicleController {

    private final AgentVehicleService agentVehicleService;

    /**
     * Constructor injection for fleet management business logic.
     */
    public AgentVehicleController(AgentVehicleService agentVehicleService) {
        this.agentVehicleService = agentVehicleService;
    }

    /**
     * Retrieves all vehicles belonging to a specific agent's fleet.
     * Supports optional filtering by system lifecycle status (e.g., 'active', 'suspended').
     */
    @GetMapping("/{agentId}/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(
            @PathVariable Long agentId,
            @RequestParam(required = false) String lifecycleStatus) {
        return ResponseEntity.ok(agentVehicleService.getAllVehicles(agentId, lifecycleStatus));
    }

    /**
     * Retrieves detailed information for a specific vehicle in an agent's fleet.
     */
    @GetMapping("/{agentId}/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId) {
        return ResponseEntity.ok(agentVehicleService.getVehicleById(agentId, vehicleId));
    }

    /**
     * Endpoint for agents to register a new vehicle into their fleet.
     */
    @PostMapping("/{agentId}/vehicles")
    public ResponseEntity<VehicleResponse> createVehicle(
            @PathVariable Long agentId,
            @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(agentVehicleService.createVehicle(agentId, request));
    }

    /**
     * Endpoint to update the comprehensive details of an existing vehicle.
     */
    @PutMapping("/{agentId}/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId,
            @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(agentVehicleService.updateVehicle(agentId, vehicleId, request));
    }

    /**
     * Endpoint to update the real-time operational status of a vehicle (e.g., 'Available', 'In Use').
     */
    @PatchMapping("/{agentId}/vehicles/{vehicleId}/status")
    public ResponseEntity<VehicleResponse> updateStatus(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(agentVehicleService.updateStatus(agentId, vehicleId, body.get("status")));
    }

    /**
     * Endpoint to update the system lifecycle status of a vehicle (e.g., 'Active', 'Maintenance', 'Retired').
     */
    @PatchMapping("/{agentId}/vehicles/{vehicleId}/lifecycle")
    public ResponseEntity<VehicleResponse> updateLifecycle(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(agentVehicleService.updateLifecycle(agentId, vehicleId, body.get("lifecycleStatus")));
    }

    /**
     * Endpoint to permanently remove a vehicle from an agent's fleet inventory.
     */
    @DeleteMapping("/{agentId}/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId) {
        agentVehicleService.deleteVehicle(agentId, vehicleId);
        return ResponseEntity.noContent().build();
    }
}