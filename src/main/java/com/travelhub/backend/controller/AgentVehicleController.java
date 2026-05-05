package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.VehicleRequest;
import com.travelhub.backend.dto.response.VehicleResponse;
import com.travelhub.backend.service.AgentVehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentVehicleController {

    private final AgentVehicleService agentVehicleService;
    public AgentVehicleController(AgentVehicleService agentVehicleService) {
        this.agentVehicleService = agentVehicleService;
    }


    @GetMapping("/{agentId}/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(
            @PathVariable Long agentId,
            @RequestParam(required = false) String lifecycleStatus) {
        return ResponseEntity.ok(agentVehicleService.getAllVehicles(agentId, lifecycleStatus));
    }

    @GetMapping("/{agentId}/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId) {
        return ResponseEntity.ok(agentVehicleService.getVehicleById(agentId, vehicleId));
    }

    @PostMapping("/{agentId}/vehicles")
    public ResponseEntity<VehicleResponse> createVehicle(
            @PathVariable Long agentId,
            @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(agentVehicleService.createVehicle(agentId, request));
    }

    @PutMapping("/{agentId}/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId,
            @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(agentVehicleService.updateVehicle(agentId, vehicleId, request));
    }

    @PatchMapping("/{agentId}/vehicles/{vehicleId}/status")
    public ResponseEntity<VehicleResponse> updateStatus(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(agentVehicleService.updateStatus(agentId, vehicleId, body.get("status")));
    }

    @PatchMapping("/{agentId}/vehicles/{vehicleId}/lifecycle")
    public ResponseEntity<VehicleResponse> updateLifecycle(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(agentVehicleService.updateLifecycle(agentId, vehicleId, body.get("lifecycleStatus")));
    }

    @DeleteMapping("/{agentId}/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long agentId,
            @PathVariable Long vehicleId) {
        agentVehicleService.deleteVehicle(agentId, vehicleId);
        return ResponseEntity.noContent().build();
    }
}