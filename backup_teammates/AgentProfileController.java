package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.service.AgentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentProfileController {

    private final AgentProfileService agentProfileService;

    @GetMapping("/profile")
    public ResponseEntity<AgentProfileResponse> getProfile() {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentProfileService.getProfile(agentId));
    }

    @PutMapping("/profile")
    public ResponseEntity<AgentProfileResponse> updateProfile(
            @RequestBody AgentProfileRequest request) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentProfileService.updateProfile(agentId, request));
    }
}