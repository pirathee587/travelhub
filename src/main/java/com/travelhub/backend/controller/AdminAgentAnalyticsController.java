package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminAgentAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

/**
 * AdminAgentAnalyticsController provides detailed performance insights for travel agents from an administrative perspective.
 * It serves data visualizations for revenue trends, operational status distributions, and overall business health.
 * Access is strictly restricted to users with the 'ADMIN' role.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAgentAnalyticsController {

    private final AdminAgentAnalyticsService adminAgentAnalyticsService;

    /**
     * Constructor injection for administrative agent analytics logic.
     */
    public AdminAgentAnalyticsController(AdminAgentAnalyticsService adminAgentAnalyticsService) {
        this.adminAgentAnalyticsService = adminAgentAnalyticsService;
    }

    /**
     * Retrieves the complete list of all agents for performance selection and comparison.
     */
    @GetMapping
    public ResponseEntity<?> getAllAgents() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agents found",
                        adminAgentAnalyticsService
                                .getAllAgents()));
    }

    /**
     * Retrieves the core performance metrics (Total Revenue, Trips, Rating, Cancellations) for a specific agent.
     * Maps to the 4 summary cards on the agent analytics dashboard.
     */
    @GetMapping("/{agentId}/stats")
    public ResponseEntity<?> getAgentStats(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent stats",
                        adminAgentAnalyticsService
                                .getAgentStats(agentId)));
    }

    /**
     * Retrieves monthly revenue trend data for a specific agent and year.
     * Used for line/bar chart visualizations. Defaults to the current year if none is specified.
     */
    @GetMapping("/{agentId}/revenue")
    public ResponseEntity<?> getMonthlyRevenue(
            @PathVariable Long agentId,
            @RequestParam(required = false)
            Integer year) {

        // Default to current system year
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

    /**
     * Retrieves the distribution of trip statuses (Completed, Pending, Cancelled) for an agent.
     * Typically used for pie/donut chart visualizations.
     */
    @GetMapping("/{agentId}/trip-status")
    public ResponseEntity<?> getTripStatus(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Trip status",
                        adminAgentAnalyticsService
                                .getTripStatus(agentId)));
    }
}