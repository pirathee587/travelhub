package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * DashboardController provides the operational overview for tourists.
 * It serves aggregated metrics and historical activity data for the user dashboard.
 */
@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Constructor injection for dashboard aggregation logic.
     */
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Retrieves high-level travel statistics for a specific user.
     * Maps to card-based metrics like Total Trips, Ongoing, and Completed counts.
     */
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@RequestParam Long userId) {
        return ResponseEntity.ok(dashboardService.getStats(userId));
    }

    /**
     * Retrieves the most recent booking activity for the user's dashboard overview.
     */
    @GetMapping("/trips/recent")
    public ResponseEntity<List<TripResponse>> getRecentTrips(@RequestParam Long userId) {
        return ResponseEntity.ok(dashboardService.getRecentTrips(userId));
    }
}
