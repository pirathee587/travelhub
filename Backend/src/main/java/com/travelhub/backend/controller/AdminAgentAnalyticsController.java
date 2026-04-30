package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service
        .AdminAgentAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost
        .PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAgentAnalyticsController {

    private final AdminAgentAnalyticsService
            adminAgentAnalyticsService;

    // ── GET /api/admin/agents ─────────────────────────
    // எல்லா agents பட்டியல்
    @GetMapping
    public ResponseEntity<?> getAllAgents() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agents found",
                        adminAgentAnalyticsService
                                .getAllAgents()));
    }

    // ── GET /api/admin/agents/{agentId}/stats ─────────
    // ஒரு agent-இன் 4 cards
    // Total Revenue, Trips, Rating, Cancellation
    @GetMapping("/{agentId}/stats")
    public ResponseEntity<?> getAgentStats(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent stats",
                        adminAgentAnalyticsService
                                .getAgentStats(agentId)));
    }

    // ── GET /api/admin/agents/{agentId}/revenue ───────
    // Monthly revenue chart data
    // ?year=2024 (optional, default current year)
    @GetMapping("/{agentId}/revenue")
    public ResponseEntity<?> getMonthlyRevenue(
            @PathVariable Long agentId,
            @RequestParam(required = false)
            Integer year) {

        // Default: current year
        int targetYear = year != null
                ? year
                : LocalDateTime.now().getYear();

        return ResponseEntity.ok(
                new ApiResponse(true, "Monthly revenue",
                        adminAgentAnalyticsService
                                .getMonthlyRevenue(
                                        agentId,
                                        targetYear)));
    }

    // ── GET /api/admin/agents/{agentId}/trip-status ───
    // Pie chart — Completed, Pending, Cancelled
    @GetMapping("/{agentId}/trip-status")
    public ResponseEntity<?> getTripStatus(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Trip status",
                        adminAgentAnalyticsService
                                .getTripStatus(agentId)));
    }
}