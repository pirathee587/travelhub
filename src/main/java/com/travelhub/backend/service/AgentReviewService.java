package com.travelhub.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.ReviewReplyRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.repository.ReviewRepository;

/**
 * AgentReviewService manages the feedback loop between agents and tourists.
 * it allows agents to view reviews left on their packages and provide management replies.
 */
@Service
public class AgentReviewService {

    private final ReviewRepository reviewRepository;

    /**
     * Constructor injection for review data access.
     */
    public AgentReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * Retrieves all reviews left on travel packages managed by a specific agent.
     * Optionally filters by a specific rating (e.g., viewing only 5-star or 1-star reviews).
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(Long agentId, Integer rating) {
        List<Review> reviews;
        if (rating != null) {
            reviews = reviewRepository.findByAgent_IdAndRating(agentId, rating);
        } else {
            reviews = reviewRepository.findByAgent_Id(agentId);
        }
        return reviews.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Adds an agent's reply to a specific review.
     * Includes a security check to ensure the review is indeed associated with the agent's package.
     */
    @Transactional
    public ReviewResponse replyToReview(Long agentId, Long reviewId, ReviewReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Security check: Verify the review belongs to the requesting agent's package
        if (review.getAgent() == null || !review.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Review for this agent", "agentId", agentId);
        }

        review.setReply(request.getReply());
        return toResponse(reviewRepository.save(review));
    }

    /**
     * Maps a Review entity to a ReviewResponse DTO.
     * Extracts customer information, package details, and the current reply status.
     */
    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                // Use email as a display name fallback if name is unavailable
                .customerName(r.getUser() != null ? r.getUser().getEmail() : "Anonymous")
                .rating(r.getRating())
                .comment(r.getComment())
                .date(r.getReviewDate() != null ? r.getReviewDate().toLocalDate().toString() : null)
                .trip(r.getBooking() != null && r.getBooking().getPkg() != null ?
                        r.getBooking().getPkg().getDestination() : null)
                .packageName(r.getBooking() != null && r.getBooking().getPkg() != null ?
                        r.getBooking().getPkg().getPackageName() : null)
                .reply(r.getReply())
                // Helper flag for frontend UI state management
                .hasReply(r.getReply() != null && !r.getReply().isEmpty())
                .build();
    }
}