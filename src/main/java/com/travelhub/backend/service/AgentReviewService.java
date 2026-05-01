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

    @Transactional
    public ReviewResponse replyToReview(Long agentId, Long reviewId, ReviewReplyRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        // Agent validation
        if (review.getAgent() == null || !review.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Review for this agent", "agentId", agentId);
        }

        review.setReply(request.getReply());
        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .customerName(r.getUser() != null ? r.getUser().getEmail() : "Anonymous")
                .rating(r.getRating())
                .comment(r.getComment())
                .date(r.getReviewDate() != null ? r.getReviewDate().toLocalDate().toString() : null)
                .trip(r.getBooking() != null && r.getBooking().getPkg() != null ?
                        r.getBooking().getPkg().getDestination() : null)
                .packageName(r.getBooking() != null && r.getBooking().getPkg() != null ?
                        r.getBooking().getPkg().getPackageName() : null)
                .reply(r.getReply())
                .hasReply(r.getReply() != null && !r.getReply().isEmpty())
                .build();
    }
}