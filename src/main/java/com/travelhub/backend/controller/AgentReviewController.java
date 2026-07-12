package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewReplyRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.service.AgentReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentReviewController {

    private final AgentReviewService agentReviewService;

    @GetMapping("/{agentId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(
            @PathVariable Long agentId,
            @RequestParam(required = false) Integer rating) {
        return ResponseEntity.ok(agentReviewService.getReviews(agentId, rating));
    }

    @PostMapping("/{agentId}/reviews/{reviewId}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(
            @PathVariable Long agentId,
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequest request) {
        return ResponseEntity.ok(agentReviewService.replyToReview(agentId, reviewId, request));
    }
}