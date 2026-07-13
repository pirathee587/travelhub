package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.VehicleOwnerRequest;
import com.travelhub.backend.dto.response.VehicleOwnerResponse;
import com.travelhub.backend.service.VehicleOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentVehicleOwnerController {

    private final VehicleOwnerService vehicleOwnerService;

    @GetMapping("/{agentId}/owners")
    public ResponseEntity<List<VehicleOwnerResponse>> getAllOwners(@PathVariable Long agentId) {
        return ResponseEntity.ok(vehicleOwnerService.getAllOwners(agentId));
    }

    @GetMapping("/{agentId}/owners/{ownerId}")
    public ResponseEntity<VehicleOwnerResponse> getOwnerById(
            @PathVariable Long agentId,
            @PathVariable Long ownerId) {
        return ResponseEntity.ok(vehicleOwnerService.getOwnerById(agentId, ownerId));
    }

    @PostMapping("/{agentId}/owners")
    public ResponseEntity<VehicleOwnerResponse> createOwner(
            @PathVariable Long agentId,
            @RequestBody VehicleOwnerRequest request) {
        return ResponseEntity.ok(vehicleOwnerService.createOwner(agentId, request));
    }

    @PutMapping("/{agentId}/owners/{ownerId}")
    public ResponseEntity<VehicleOwnerResponse> updateOwner(
            @PathVariable Long agentId,
            @PathVariable Long ownerId,
            @RequestBody VehicleOwnerRequest request) {
        return ResponseEntity.ok(vehicleOwnerService.updateOwner(agentId, ownerId, request));
    }
}
