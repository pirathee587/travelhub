package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AnalyticsResponse;
import com.travelhub.backend.service.AgentAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentAnalyticsController {

    private final AgentAnalyticsService agentAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(required = false, defaultValue = "monthly") String period) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentAnalyticsService.getAnalytics(agentId, period));
    }
}