package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.dto.response.ReviewSummaryResponse;
import com.travelhub.backend.service.ReviewService;
import com.travelhub.backend.service.ImageUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final ImageUploadService imageUploadService;

    public ReviewController(ReviewService reviewService, ImageUploadService imageUploadService) {
        this.reviewService = reviewService;
        this.imageUploadService = imageUploadService;
    }

    // GET /api/reviews/package/1
    @GetMapping("/reviews/package/{packageId}")
    public ResponseEntity<List<ReviewResponse>> getPackageReviews(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(reviewService.getPackageReviews(packageId));
    }

    // GET /api/reviews/hotel/1
    @GetMapping("/reviews/hotel/{hotelId}")
    public ResponseEntity<List<ReviewResponse>> getHotelReviews(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    // GET /api/reviews/package/1/rating
    @GetMapping("/reviews/package/{packageId}/rating")
    public ResponseEntity<ReviewSummaryResponse> getPackageRatingSummary(
            @PathVariable Long packageId) {
        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAverageRating(reviewService.getAveragePackageRating(packageId));
        summary.setReviewCount(reviewService.getPackageReviewCount(packageId));
        return ResponseEntity.ok(summary);
    }

    // GET /api/reviews/hotel/1/rating
    @GetMapping("/reviews/hotel/{hotelId}/rating")
    public ResponseEntity<ReviewSummaryResponse> getHotelRatingSummary(
            @PathVariable Long hotelId) {
        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAverageRating(reviewService.getAverageHotelRating(hotelId));
        summary.setReviewCount(reviewService.getHotelReviewCount(hotelId));
        return ResponseEntity.ok(summary);
    }

    // POST /api/tourist/reviews/package/1
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
    @PostMapping(value = "/tourist/reviews/hotel/{hotelId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ReviewResponse> addHotelReview(
            @PathVariable Long hotelId,
            @RequestPart("review") String reviewJson,
            @RequestPart(value = "images", required = false) List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ReviewRequest request = mapper.readValue(reviewJson, ReviewRequest.class);
            return ResponseEntity.ok(reviewService.addHotelReview(hotelId, request, images));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review data: " + e.getMessage(), e);
        }
    }
}