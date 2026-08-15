package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.dto.response.TouristOverviewResponse;
import com.travelhub.backend.dto.response.UserProfileResponse;
import com.travelhub.backend.dto.response.ImageUploadResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.service.DashboardService;
import com.travelhub.backend.service.ImageUploadService;
import com.travelhub.backend.service.TouristAggregatorService;
import com.travelhub.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final ImageUploadService imageUploadService;
    private final TouristAggregatorService touristAggregatorService;

    // ── Aggregated endpoint ───────────────────────────────────────────────────
    // GET /api/tourist/overview?userId=1
    // Combines stats + trips + documents + recommendations into one request.
    // Replaces four separate frontend API calls on the Overview page.
    @GetMapping("/overview")
    public ResponseEntity<TouristOverviewResponse> getOverview(@RequestParam Long userId) {
        return ResponseEntity.ok(touristAggregatorService.getOverview(userId));
    }

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

    /**
     * POST /api/tourist/profile/image?userId=32
     * Uploads and updates the profile picture of the tourist.
     */
    @PostMapping("/profile/image")
    public ResponseEntity<UserProfileResponse> uploadProfileImage(
            @RequestParam Long userId,
            @RequestParam("file") MultipartFile file) {
        ImageUploadResponse uploadResponse = imageUploadService.uploadProfileImage(file);
        User user = userService.updateProfileImage(userId, uploadResponse.getImageUrl());
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
                .currencyPreference(user.getCurrencyPreference() != null ? user.getCurrencyPreference() : "USD")
                .build();
    }
}
