package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.PackageRequest;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.AgentPackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
@CrossOrigin(origins = "*")
public class AgentPackageController {

    private final AgentPackageService agentPackageService;

    public AgentPackageController(AgentPackageService agentPackageService) {
        this.agentPackageService = agentPackageService;
    }

    @GetMapping("/{agentId}/packages")
    public ResponseEntity<?> getPackages(@PathVariable Long agentId) {
        return ResponseEntity.ok(agentPackageService.getAgentPackages(agentId));
    }

    @PostMapping("/{agentId}/packages")
    public ResponseEntity<PackageResponse> createPackage(
            @PathVariable Long agentId,
            @RequestBody PackageRequest request) {
        return ResponseEntity.ok(agentPackageService.createPackage(agentId, request));
    }

    @PutMapping("/{agentId}/packages/{packageId}")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long agentId,
            @PathVariable Long packageId,
            @RequestBody PackageRequest request) {
        return ResponseEntity.ok(agentPackageService.updatePackage(agentId, packageId, request));
    }

    @DeleteMapping("/{agentId}/packages/{packageId}")
    public ResponseEntity<Void> deletePackage(
            @PathVariable Long agentId,
            @PathVariable Long packageId) {
        agentPackageService.deletePackage(agentId, packageId);
        return ResponseEntity.noContent().build();
    }
}
