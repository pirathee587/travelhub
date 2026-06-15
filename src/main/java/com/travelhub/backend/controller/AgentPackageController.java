package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.PackageRequest;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.AgentPackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AgentPackageController manages the lifecycle of travel packages created by agents.
 * It provides endpoints for listing, creating, updating, and deleting travel products.
 */
@RestController
@RequestMapping("/api/v1/agent")
@CrossOrigin(origins = "*")
public class AgentPackageController {

    private final AgentPackageService agentPackageService;

    /**
     * Constructor injection for agent package business logic.
     */
    public AgentPackageController(AgentPackageService agentPackageService) {
        this.agentPackageService = agentPackageService;
    }

    /**
     * Retrieves all travel packages belonging to a specific agent.
     */
    @GetMapping("/{agentId}/packages")
    public ResponseEntity<?> getPackages(@PathVariable Long agentId) {
        return ResponseEntity.ok(agentPackageService.getAgentPackages(agentId));
    }

    /**
     * Endpoint for agents to register a new travel package.
     * Includes metadata for itineraries, categories, and pricing.
     */
    @PostMapping("/{agentId}/packages")
    public ResponseEntity<PackageResponse> createPackage(
            @PathVariable Long agentId,
            @RequestBody PackageRequest request) {
        return ResponseEntity.ok(agentPackageService.createPackage(agentId, request));
    }

    /**
     * Endpoint to update the details of an existing travel package.
     */
    @PutMapping("/{agentId}/packages/{packageId}")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long agentId,
            @PathVariable Long packageId,
            @RequestBody PackageRequest request) {
        return ResponseEntity.ok(agentPackageService.updatePackage(agentId, packageId, request));
    }

    /**
     * Endpoint to permanently remove a travel package from the agent's inventory.
     */
    @DeleteMapping("/{agentId}/packages/{packageId}")
    public ResponseEntity<Void> deletePackage(
            @PathVariable Long agentId,
            @PathVariable Long packageId) {
        agentPackageService.deletePackage(agentId, packageId);
        return ResponseEntity.noContent().build();
    }
}
