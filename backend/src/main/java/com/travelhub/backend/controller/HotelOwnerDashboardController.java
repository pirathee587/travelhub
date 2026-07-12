package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.HotelDashboardStatsResponse;
import com.travelhub.backend.service.HotelOwnerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
public class HotelOwnerDashboardController {

    private final HotelOwnerDashboardService dashboardService;

    // GET /api/owner/dashboard/hotel/{hotelId}
    @GetMapping("/dashboard/hotel/{hotelId}")
    public ResponseEntity<HotelDashboardStatsResponse> getHotelDashboardStats(@PathVariable Long hotelId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(hotelId));
    }
}
