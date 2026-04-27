package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    // GET /api/tourist/stats?userId=1
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@RequestParam Long userId) {
        return ResponseEntity.ok(dashboardService.getStats(userId));
    }

    // GET /api/tourist/trips/recent?userId=1
    @GetMapping("/trips/recent")
    public ResponseEntity<List<TripResponse>> getRecentTrips(@RequestParam Long userId) {
        return ResponseEntity.ok(dashboardService.getRecentTrips(userId));
    }
}
