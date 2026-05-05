package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.service.AgentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentDashboardController {

    private final AgentDashboardService agentDashboardService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AgentDashboardStatsResponse> getStats() {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentDashboardService.getStats(agentId));
    }
}