package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.HotelDashboardStatsResponse;
import com.travelhub.backend.service.HotelOwnerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * HotelOwnerDashboardController provides the operational metrics for hotel property managers.
 * It serves aggregated data related to room inventory, guest feedback, and overall property performance.
 */
@RestController
@RequestMapping("/api/v1/owner")
@CrossOrigin(origins = "*")
public class HotelOwnerDashboardController {

    private final HotelOwnerDashboardService dashboardService;

    /**
     * Constructor injection for hotel-specific dashboard aggregation logic.
     */
    public HotelOwnerDashboardController(HotelOwnerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Retrieves high-level operational statistics for a specific hotel property.
     * Includes metrics for total rooms, current availability, and calculated rating summaries.
     */
    @GetMapping("/dashboard/hotel/{hotelId}")
    public ResponseEntity<HotelDashboardStatsResponse> getHotelDashboardStats(@PathVariable Long hotelId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(hotelId));
    }
}
