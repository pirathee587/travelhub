package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AdminDashboardController serves the primary analytical overview for platform administrators.
 * It provides aggregated metrics across all system entities (users, bookings, revenue).
 * Access is strictly restricted to users with the 'ADMIN' role.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Constructor injection for platform-wide dashboard aggregation logic.
     */
    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    /**
     * Retrieves the high-level system health and performance statistics.
     * Maps to the administrative dashboard cards and summary charts.
     */
    @GetMapping
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Dashboard stats",
                        adminDashboardService.getDashboardStats()));
    }
}