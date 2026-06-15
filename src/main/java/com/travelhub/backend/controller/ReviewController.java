package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.dto.response.ReviewSummaryResponse;
import com.travelhub.backend.service.ReviewService;
import com.travelhub.backend.service.ImageUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * ReviewController manages the public-facing feedback and reputation endpoints.
 * It provides tools for tourists to share their experiences and for all users to view aggregated quality metrics for hotels and packages.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final ImageUploadService imageUploadService;

    /**
     * Constructor injection for review management and image handling.
     */
    public ReviewController(ReviewService reviewService, ImageUploadService imageUploadService) {
        this.reviewService = reviewService;
        this.imageUploadService = imageUploadService;
    }

    /**
     * Retrieves all customer reviews for a specific travel package.
     */
    @GetMapping("/reviews/package/{packageId}")
    public ResponseEntity<List<ReviewResponse>> getPackageReviews(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(reviewService.getPackageReviews(packageId));
    }

    /**
     * Retrieves all customer reviews for a specific hotel property.
     */
    @GetMapping("/reviews/hotel/{hotelId}")
    public ResponseEntity<List<ReviewResponse>> getHotelReviews(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    /**
     * Retrieves the aggregated rating summary (average score and total count) for a travel package.
     */
    @GetMapping("/reviews/package/{packageId}/rating")
    public ResponseEntity<ReviewSummaryResponse> getPackageRatingSummary(
            @PathVariable Long packageId) {
        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAverageRating(reviewService.getAveragePackageRating(packageId));
        summary.setReviewCount(reviewService.getPackageReviewCount(packageId));
        return ResponseEntity.ok(summary);
    }

    /**
     * Retrieves the aggregated rating summary (average score and total count) for a hotel property.
     */
    @GetMapping("/reviews/hotel/{hotelId}/rating")
    public ResponseEntity<ReviewSummaryResponse> getHotelRatingSummary(
            @PathVariable Long hotelId) {
        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAverageRating(reviewService.getAverageHotelRating(hotelId));
        summary.setReviewCount(reviewService.getHotelReviewCount(hotelId));
        return ResponseEntity.ok(summary);
    }

    /**
     * Endpoint for tourists to submit a review for a travel package.
     * Handles complex multipart/form-data containing both JSON review metadata and optional image uploads.
     */
    @PostMapping(value = "/tourist/reviews/package/{packageId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewResponse> addPackageReview(
            @PathVariable Long packageId,
            @RequestPart("review") String reviewJson,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            // Manual parsing required for combined multipart/string data
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ReviewRequest request = mapper.readValue(reviewJson, ReviewRequest.class);
            return ResponseEntity.ok(reviewService.addPackageReview(packageId, request, images));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review data: " + e.getMessage(), e);
        }
    }

    /**
     * Endpoint for tourists to submit a review for a hotel property.
     * Handles complex multipart/form-data containing both JSON review metadata and optional image uploads.
     */
    @PostMapping(value = "/tourist/reviews/hotel/{hotelId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewResponse> addHotelReview(
            @PathVariable Long hotelId,
            @RequestPart("review") String reviewJson,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            // Manual parsing required for combined multipart/string data
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ReviewRequest request = mapper.readValue(reviewJson, ReviewRequest.class);
            return ResponseEntity.ok(reviewService.addHotelReview(hotelId, request, images));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review data: " + e.getMessage(), e);
        }
    }
}