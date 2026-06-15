package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.service.AgentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AgentProfileController manages endpoints for travel agent account management.
 * It provides tools for retrieving professional profiles and updating business identity data.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentProfileController {

    private final AgentProfileService agentProfileService;

    /**
     * Constructor injection for agent profile business logic.
     */
    public AgentProfileController(AgentProfileService agentProfileService) {
        this.agentProfileService = agentProfileService;
    }

    /**
     * Retrieves the comprehensive professional profile for a specific agent.
     */
    @GetMapping("/{agentId}/profile")
    public ResponseEntity<AgentProfileResponse> getProfile(@PathVariable Long agentId) {
        return ResponseEntity.ok(agentProfileService.getProfile(agentId));
    }

    /**
     * Endpoint to update an agent's profile information.
     * Synchronizes both core account details and professional business metadata.
     */
    @PutMapping("/{agentId}/profile")
    public ResponseEntity<AgentProfileResponse> updateProfile(
            @PathVariable Long agentId,
            @RequestBody AgentProfileRequest request) {
        return ResponseEntity.ok(agentProfileService.updateProfile(agentId, request));
    }
}