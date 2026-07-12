package com.travelhub.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.dto.response.ReviewSummaryResponse;
import com.travelhub.backend.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // GET /api/reviews/package/1
    //GET package reviews by package id
    @GetMapping("/reviews/package/{packageId}")
    public ResponseEntity<List<ReviewResponse>> getPackageReviews(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(reviewService.getPackageReviews(packageId));
    }

    // GET /api/reviews/hotel/1
    //GET HOtel reviews by hotel id
    @GetMapping("/reviews/hotel/{hotelId}")
    public ResponseEntity<List<ReviewResponse>> getHotelReviews(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    // GET /api/reviews/user/1
    //GET all reviews created by a specific user
    @GetMapping("/reviews/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(
            @PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

        // GET /api/reviews/package/1/rating
        //GET package review count and average rating by package id
        @GetMapping("/reviews/package/{packageId}/rating")
        public ResponseEntity<ReviewSummaryResponse> getPackageRatingSummary(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(ReviewSummaryResponse.builder()
            .averageRating(reviewService.getAveragePackageRating(packageId))
            .reviewCount(reviewService.getPackageReviewCount(packageId))
            .build());
        }

        // GET /api/reviews/hotel/1/rating
        //GET hotel review count and average rating by hotel id
        @GetMapping("/reviews/hotel/{hotelId}/rating")
        public ResponseEntity<ReviewSummaryResponse> getHotelRatingSummary(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(ReviewSummaryResponse.builder()
            .averageRating(reviewService.getAverageHotelRating(hotelId))
            .reviewCount(reviewService.getHotelReviewCount(hotelId))
            .build());
        }



// Hotel, Package Review Submission


    // POST /api/tourist/reviews/package/1
    //Insert package review with image upload
    @PostMapping(value = "/tourist/reviews/package/{packageId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewResponse> addPackageReview(
            @PathVariable Long packageId,
            @RequestPart("review") String reviewJson,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ReviewRequest request = mapper.readValue(reviewJson, ReviewRequest.class);
            return ResponseEntity.ok(reviewService.addPackageReview(packageId, request, images));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review data: " + e.getMessage(), e);
        }
    }

    // POST /api/tourist/reviews/hotel/1
    //Insert hotel review with image upload
    @PostMapping(value = "/tourist/reviews/hotel/{hotelId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewResponse> addHotelReview(
            @PathVariable Long hotelId,                     //Hotel Id
            @RequestPart("review") String reviewJson,       //Review Data,   Review Image
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ReviewRequest request = mapper.readValue(reviewJson, ReviewRequest.class);
            return ResponseEntity.ok(reviewService.addHotelReview(hotelId, request, images));       //Service 
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review data: " + e.getMessage(), e);        //Error Handle
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/reviews/{reviewId} - Update review with authorization
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping(value = "/reviews/{reviewId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @RequestPart("review") String reviewJson,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images,
            @RequestPart("userId") String userIdStr) {
        try {
            Long userId = Long.parseLong(userIdStr);
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ReviewRequest request = mapper.readValue(reviewJson, ReviewRequest.class);
            return ResponseEntity.ok(reviewService.updateReview(reviewId, userId, request, images));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID format", e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review data: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/reviews/{reviewId} - Delete review with authorization
    // ─────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @RequestParam Long userId) {
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}