package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.*;
import com.travelhub.backend.service.TouristAggregatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller exposing API Aggregator endpoints exclusively for the Tourist Portal.
 *
 * Provides composite endpoints to reduce frontend network round-trips:
 * - GET /api/tourist/overview?userId={userId}
 * - GET /api/tourist/explore-data?userId={userId}
 * - GET /api/tourist/packages/{id}/page-data
 * - GET /api/tourist/hotels/{id}/page-data
 */
@RestController
@RequestMapping("/api/tourist")
@RequiredArgsConstructor
public class TouristAggregatorController {

    private final TouristAggregatorService touristAggregatorService;

    /**
     * GET /api/tourist/overview?userId={userId}
     * Combines stats, trips, documents, and recommendations for the Dashboard Overview page.
     */
    @GetMapping("/overview")
    public ResponseEntity<TouristOverviewResponse> getOverview(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(touristAggregatorService.getOverview(userId));
    }

    /**
     * GET /api/tourist/explore-data?userId={userId}
     * Combines all packages and personalized recommendations for the Explore page.
     */
    @GetMapping("/explore-data")
    public ResponseEntity<TouristExploreResponse> getExploreData(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(touristAggregatorService.getExploreData(userId));
    }

    /**
     * GET /api/tourist/packages/{id}/page-data
     * Combines package details, reviews, and average rating summary for the Package Details page.
     */
    @GetMapping("/packages/{id}/page-data")
    public ResponseEntity<TouristPackageDetailsResponse> getPackagePageData(
            @PathVariable Long id) {
        return ResponseEntity.ok(touristAggregatorService.getPackagePageData(id));
    }

    /**
     * GET /api/tourist/hotels/{id}/page-data
     * Combines hotel details, room list, images, reviews, and rating summary for the Hotel Details page.
     */
    @GetMapping("/hotels/{id}/page-data")
    public ResponseEntity<TouristHotelDetailsResponse> getHotelPageData(
            @PathVariable Long id) {
        return ResponseEntity.ok(touristAggregatorService.getHotelPageData(id));
    }
}
