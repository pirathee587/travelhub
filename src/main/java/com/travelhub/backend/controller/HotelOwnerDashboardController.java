package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.HotelDashboardStatsResponse;
import com.travelhub.backend.service.HotelOwnerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelOwnerDashboardController {

    private final HotelOwnerDashboardService dashboardService;

    // GET /api/owner/dashboard/stats
    @GetMapping("/dashboard/stats")
    public ResponseEntity<HotelDashboardStatsResponse> getHotelDashboardStats() {
        Long hotelId = com.travelhub.backend.util.SecurityUtils.getCurrentHotelId();
        if (hotelId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Hotel ID not found in token");
        }
        return ResponseEntity.ok(dashboardService.getDashboardStats(hotelId));
    }
}
