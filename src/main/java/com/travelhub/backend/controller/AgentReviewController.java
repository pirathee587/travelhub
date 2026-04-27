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

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(
            @RequestParam(required = false) Integer rating) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentReviewService.getReviews(agentId, rating));
    }

    @PostMapping("/reviews/{reviewId}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequest request) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentReviewService.replyToReview(agentId, reviewId, request));
    }
}