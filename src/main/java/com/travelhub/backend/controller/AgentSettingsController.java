package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.SettingsRequest;
import com.travelhub.backend.dto.response.SettingsResponse;
import com.travelhub.backend.service.AgentSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AgentSettingsController manages the personalized configuration endpoints for travel agents.
 * It provides tools for agents to manage their platform preferences, such as notification toggles and localized settings.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentSettingsController {

    private final AgentSettingsService agentSettingsService;

    /**
     * Constructor injection for agent settings business logic.
     */
    public AgentSettingsController(AgentSettingsService agentSettingsService) {
        this.agentSettingsService = agentSettingsService;
    }

    /**
     * Retrieves the current system settings and notification preferences for a specific agent.
     */
    @GetMapping("/{agentId}/settings")
    public ResponseEntity<SettingsResponse> getSettings(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentSettingsService.getSettings(agentId));
    }

    /**
     * Updates an agent's platform preferences.
     * Allows toggling of various operational alerts (e.g., New Booking, Cancellation) and regional settings.
     */
    @PutMapping("/{agentId}/settings")
    public ResponseEntity<SettingsResponse> updateSettings(
            @PathVariable Long agentId,
            @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(agentSettingsService.updateSettings(agentId, request));
    }
}