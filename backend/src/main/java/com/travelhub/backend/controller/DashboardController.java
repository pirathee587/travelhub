package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.dto.response.UserProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.service.DashboardService;
import com.travelhub.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

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

    // ─────────────────────────────────────────────────────────────────────────
    // Profile endpoints — no JWT required (dev mode: userId passed as param)
    // TODO: When JWT auth is enabled, replace @RequestParam Long userId with
    //       Long userId = SecurityUtils.getCurrentUserId(); and remove the param.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tourist/profile?userId=32
     * Returns the profile of the currently active user.
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@RequestParam Long userId) {
        User user = userService.getProfile(userId);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    /**
     * PUT /api/tourist/profile?userId=32
     * Updates the profile of the currently active user.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestParam Long userId,
            @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(userId, request);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .profileImage(user.getProfileImage())
                .nationality(user.getNationality())
                .preferredLanguage(user.getPreferredLanguage())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }
}
