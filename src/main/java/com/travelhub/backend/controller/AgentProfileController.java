package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.service.AgentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentProfileController {

    private final AgentProfileService agentProfileService;
    public AgentProfileController(AgentProfileService agentProfileService) {
        this.agentProfileService = agentProfileService;
    }


    @GetMapping("/{agentId}/profile")
    public ResponseEntity<AgentProfileResponse> getProfile(@PathVariable Long agentId) {
        return ResponseEntity.ok(agentProfileService.getProfile(agentId));
    }

    @PutMapping("/{agentId}/profile")
    public ResponseEntity<AgentProfileResponse> updateProfile(
            @PathVariable Long agentId,
            @RequestBody AgentProfileRequest request) {
        return ResponseEntity.ok(agentProfileService.updateProfile(agentId, request));
    }
}