package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.VehicleRequest;
import com.travelhub.backend.dto.response.VehicleResponse;
import com.travelhub.backend.service.AgentVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentVehicleController {

    private final AgentVehicleService agentVehicleService;

    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles(
            @RequestParam(required = false) String lifecycleStatus) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentVehicleService.getAllVehicles(agentId, lifecycleStatus));
    }

    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long vehicleId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentVehicleService.getVehicleById(agentId, vehicleId));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleResponse> createVehicle(
            @RequestBody VehicleRequest request) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentVehicleService.createVehicle(agentId, request));
    }

    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long vehicleId,
            @RequestBody VehicleRequest request) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentVehicleService.updateVehicle(agentId, vehicleId, request));
    }

    @PatchMapping("/vehicles/{vehicleId}/status")
    public ResponseEntity<VehicleResponse> updateStatus(
            @PathVariable Long vehicleId,
            @RequestBody Map<String, String> body) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentVehicleService.updateStatus(agentId, vehicleId, body.get("status")));
    }

    @PatchMapping("/vehicles/{vehicleId}/lifecycle")
    public ResponseEntity<VehicleResponse> updateLifecycle(
            @PathVariable Long vehicleId,
            @RequestBody Map<String, String> body) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentVehicleService.updateLifecycle(agentId, vehicleId, body.get("lifecycleStatus")));
    }

    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long vehicleId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        agentVehicleService.deleteVehicle(agentId, vehicleId);
        return ResponseEntity.noContent().build();
    }
}