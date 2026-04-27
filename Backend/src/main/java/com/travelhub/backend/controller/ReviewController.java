package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

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

    // POST /api/tourist/reviews/package/1
    @PostMapping("/tourist/reviews/package/{packageId}")
    public ResponseEntity<ReviewResponse> addPackageReview(
            @PathVariable Long packageId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addPackageReview(packageId, request));
    }
    // POST /api/tourist/reviews/upload-image
    @PostMapping("/tourist/reviews/upload-image")
    public ResponseEntity<String> uploadReviewImage(
            @RequestParam("file") MultipartFile file) {
        String url = reviewService.uploadImage(file);
        return ResponseEntity.ok(url);
    }

    // POST /api/tourist/reviews/hotel/1
    @PostMapping("/tourist/reviews/hotel/{hotelId}")
    public ResponseEntity<ReviewResponse> addHotelReview(
            @PathVariable Long hotelId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addHotelReview(hotelId, request));
    }
}