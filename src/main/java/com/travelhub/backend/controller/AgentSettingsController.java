package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.SettingsRequest;
import com.travelhub.backend.dto.response.SettingsResponse;
import com.travelhub.backend.service.AgentSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentSettingsController {

    private final AgentSettingsService agentSettingsService;

    @GetMapping("/settings")
    public ResponseEntity<SettingsResponse> getSettings() {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentSettingsService.getSettings(agentId));
    }

    @PutMapping("/settings")
    public ResponseEntity<SettingsResponse> updateSettings(
            @RequestBody SettingsRequest request) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentSettingsService.updateSettings(agentId, request));
    }
}