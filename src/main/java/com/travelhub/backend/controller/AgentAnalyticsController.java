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

    @GetMapping("/{agentId}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable Long agentId,
            @RequestParam(required = false, defaultValue = "monthly") String period) {
        return ResponseEntity.ok(agentAnalyticsService.getAnalytics(agentId, period));
    }
}