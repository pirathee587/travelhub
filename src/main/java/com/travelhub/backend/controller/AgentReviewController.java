package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewReplyRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.service.AgentReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * AgentReviewController manages the feedback and reputation endpoints for travel agents.
 * It provides tools for agents to monitor customer satisfaction and engage with user reviews.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentReviewController {

    private final AgentReviewService agentReviewService;

    /**
     * Constructor injection for agent-specific review business logic.
     */
    public AgentReviewController(AgentReviewService agentReviewService) {
        this.agentReviewService = agentReviewService;
    }

    /**
     * Retrieves all customer reviews for travel packages managed by the agent.
     * Supports optional filtering by star rating.
     */
    @GetMapping("/{agentId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(
            @PathVariable Long agentId,
            @RequestParam(required = false) Integer rating) {
        return ResponseEntity.ok(agentReviewService.getReviews(agentId, rating));
    }

    /**
     * Endpoint for agents to provide a public reply to a customer review.
     * This engagement helps in reputation management and customer service.
     */
    @PostMapping("/{agentId}/reviews/{reviewId}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(
            @PathVariable Long agentId,
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequest request) {
        return ResponseEntity.ok(agentReviewService.replyToReview(agentId, reviewId, request));
    }
}