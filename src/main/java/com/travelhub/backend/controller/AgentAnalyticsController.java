package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AnalyticsResponse;
import com.travelhub.backend.service.AgentAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AgentAnalyticsController manages the data-driven insight endpoints for travel agents.
 * It provides detailed performance metrics over specified time periods to help agents optimize their operations.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentAnalyticsController {

    private final AgentAnalyticsService agentAnalyticsService;

    /**
     * Constructor injection for specialized agent analytics logic.
     */
    public AgentAnalyticsController(AgentAnalyticsService agentAnalyticsService) {
        this.agentAnalyticsService = agentAnalyticsService;
    }

    /**
     * Retrieves comprehensive performance analytics for an agent.
     * Supports various time granularities (e.g., 'weekly', 'monthly', 'yearly') via the period parameter.
     */
    @GetMapping("/{agentId}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable Long agentId,
            @RequestParam(required = false, defaultValue = "monthly") String period) {
        return ResponseEntity.ok(agentAnalyticsService.getAnalytics(agentId, period));
    }
}