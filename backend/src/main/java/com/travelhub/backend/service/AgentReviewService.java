package com.travelhub.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.common.ResourceNotFoundException; // Intha import correct-ah irukanum
import com.travelhub.backend.dto.request.ReviewReplyRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgentReviewService {

    private final ReviewRepository reviewRepository;
    private final com.travelhub.backend.repository.AgentRepository agentRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviews(Long ownerId, Integer rating) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "ownerId", ownerId));
        
        List<Review> reviews;
        if (rating != null) {
            reviews = reviewRepository.findByAgent_IdAndRating(agent.getId(), rating);
        } else {
            reviews = reviewRepository.findByAgent_Id(agent.getId());
        }
        return reviews.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse replyToReview(Long ownerId, Long reviewId, ReviewReplyRequest request) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "ownerId", ownerId));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Agent validation
        if (review.getAgent() == null || !review.getAgent().getId().equals(agent.getId())) {
            throw new ResourceNotFoundException("Review for this agent", "agentId", agent.getId());
        }

        review.setReply(request.getReply());
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review r) {
        String trip = null;
        String packageName = null;
        Long packageId = null;

        if (r.getPkg() != null) {
            trip = r.getPkg().getDestination();
            packageName = r.getPkg().getPackageName();
            packageId = r.getPkg().getId();
        } else if (r.getBooking() != null && r.getBooking().getPkg() != null) {
            trip = r.getBooking().getPkg().getDestination();
            packageName = r.getBooking().getPkg().getPackageName();
            packageId = r.getBooking().getPkg().getId();
        }

        return ReviewResponse.builder()
                .id(r.getId())
                .customerName(r.getUser() != null ? r.getUser().getEmail() : "Anonymous")
                .rating(r.getRating())
                .comment(r.getComment())
                .date(r.getReviewDate() != null ? r.getReviewDate().toLocalDate().toString() : null)
                .trip(trip)
                .packageName(packageName)
                .packageId(packageId)
                .reply(r.getReply())
                .hasReply(r.getReply() != null && !r.getReply().isEmpty())
                .build();
    }
}