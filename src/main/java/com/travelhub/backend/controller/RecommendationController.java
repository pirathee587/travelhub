package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * RecommendationController manages endpoints for smart travel discovery.
 * It provides personalized package suggestions based on user preferences and historical behavior.
 */
@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * Constructor injection for personalized recommendation logic.
     */
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Retrieves a list of recommended travel packages tailored to the specific user.
     * Recommendations are ranked by relevance and rating.
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<PackageResponse>> getRecommendations(
            @RequestParam Long userId) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId));
    }
}