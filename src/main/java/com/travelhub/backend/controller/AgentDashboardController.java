package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.service.AgentDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentDashboardController {

    private final AgentDashboardService agentDashboardService;
    public AgentDashboardController(AgentDashboardService agentDashboardService) {
        this.agentDashboardService = agentDashboardService;
    }


    @GetMapping("/{agentId}/dashboard/stats")
    public ResponseEntity<AgentDashboardStatsResponse> getStats(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentDashboardService.getStats(agentId));
    }
}