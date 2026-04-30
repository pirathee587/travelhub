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

    @GetMapping("/{agentId}/settings")
    public ResponseEntity<SettingsResponse> getSettings(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentSettingsService.getSettings(agentId));
    }

    @PutMapping("/{agentId}/settings")
    public ResponseEntity<SettingsResponse> updateSettings(
            @PathVariable Long agentId,
            @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(agentSettingsService.updateSettings(agentId, request));
    }
}