package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.dto.response.ReviewSummaryResponse;
import com.travelhub.backend.dto.response.ImageUploadResponse;
import com.travelhub.backend.service.ReviewService;
import com.travelhub.backend.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;
    private final ImageUploadService imageUploadService;

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
        return ResponseEntity.ok(ReviewSummaryResponse.builder()
            .averageRating(reviewService.getAveragePackageRating(packageId))
            .reviewCount(reviewService.getPackageReviewCount(packageId))
            .build());
        }

        // GET /api/reviews/hotel/1/rating
        @GetMapping("/reviews/hotel/{hotelId}/rating")
        public ResponseEntity<ReviewSummaryResponse> getHotelRatingSummary(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(ReviewSummaryResponse.builder()
            .averageRating(reviewService.getAverageHotelRating(hotelId))
            .reviewCount(reviewService.getHotelReviewCount(hotelId))
            .build());
        }

    // POST /api/tourist/reviews/package/1
    @PostMapping("/tourist/reviews/package/{packageId}")
    public ResponseEntity<ReviewResponse> addPackageReview(
            @PathVariable Long packageId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addPackageReview(packageId, request));
    }

    // POST /api/tourist/reviews/hotel/1
    @PostMapping("/tourist/reviews/hotel/{hotelId}")
    public ResponseEntity<ReviewResponse> addHotelReview(
            @PathVariable Long hotelId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addHotelReview(hotelId, request));
    }
    
    // ✅ FIXED: Image upload endpoint — now uploads to Supabase via ImageUploadService
    @PostMapping("/tourist/reviews/upload-image")
    public ResponseEntity<String> uploadReviewImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            ImageUploadResponse response = imageUploadService.uploadRoomImage(file);
            return ResponseEntity.ok(response.getImageUrl());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}