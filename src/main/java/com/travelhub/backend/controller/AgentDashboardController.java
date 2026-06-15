package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.service.AgentDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AgentDashboardController provides the operational metrics for travel agents.
 * It serves aggregated performance data including booking counts, revenue summaries, and rating metrics.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentDashboardController {

    private final AgentDashboardService agentDashboardService;

    /**
     * Constructor injection for agent-specific dashboard aggregation logic.
     */
    public AgentDashboardController(AgentDashboardService agentDashboardService) {
        this.agentDashboardService = agentDashboardService;
    }

    /**
     * Retrieves high-level operational statistics for an agent's dashboard.
     * Aggregates metrics scoped strictly to the requesting agent's performance.
     */
    @GetMapping("/{agentId}/dashboard/stats")
    public ResponseEntity<AgentDashboardStatsResponse> getStats(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentDashboardService.getStats(agentId));
    }
}