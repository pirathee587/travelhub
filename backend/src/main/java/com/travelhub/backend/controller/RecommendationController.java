package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.dto.response.TopicResponse;
import com.travelhub.backend.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // GET /api/tourist/recommendations?userId=1
    @GetMapping("/recommendations")
    public ResponseEntity<List<PackageResponse>> getRecommendations(
            @RequestParam Long userId) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId));
    }

    // GET /api/tourist/recommendations/topics?userId=1
    @GetMapping("/recommendations/topics")
    public ResponseEntity<List<TopicResponse>> getTopicRecommendations(
            @RequestParam Long userId) {
        return ResponseEntity.ok(recommendationService.getTopicRecommendations(userId));
    }
}