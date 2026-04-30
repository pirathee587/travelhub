package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    // ─────────── GET reviews ───────────

    /** GET /api/reviews/package/{packageId} */
    @GetMapping("/reviews/package/{packageId}")
    public ResponseEntity<List<ReviewResponse>> getPackageReviews(@PathVariable Long packageId) {
        return ResponseEntity.ok(reviewService.getPackageReviews(packageId));
    }

    /** GET /api/reviews/hotel/{hotelId} */
    @GetMapping("/reviews/hotel/{hotelId}")
    public ResponseEntity<List<ReviewResponse>> getHotelReviews(@PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    // ─────────── GET average ratings ───────────

    /**
     * ✅ NEW: GET /api/reviews/package/{packageId}/rating
     * Returns { "averageRating": 4.3, "reviewCount": 12 }
     */
    @GetMapping("/reviews/package/{packageId}/rating")
    public ResponseEntity<Map<String, Object>> getPackageAverageRating(@PathVariable Long packageId) {
        return ResponseEntity.ok(Map.of(
                "averageRating", reviewService.getAveragePackageRating(packageId),
                "reviewCount",   reviewService.getPackageReviewCount(packageId)
        ));
    }

    /**
     * ✅ NEW: GET /api/reviews/hotel/{hotelId}/rating
     * Returns { "averageRating": 4.1, "reviewCount": 8 }
     */
    @GetMapping("/reviews/hotel/{hotelId}/rating")
    public ResponseEntity<Map<String, Object>> getHotelAverageRating(@PathVariable Long hotelId) {
        return ResponseEntity.ok(Map.of(
                "averageRating", reviewService.getAverageHotelRating(hotelId),
                "reviewCount",   reviewService.getHotelReviewCount(hotelId)
        ));
    }

    // ─────────── POST reviews ───────────

    /** POST /api/tourist/reviews/package/{packageId} */
    @PostMapping("/tourist/reviews/package/{packageId}")
    public ResponseEntity<ReviewResponse> addPackageReview(
            @PathVariable Long packageId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addPackageReview(packageId, request));
    }

    /** POST /api/tourist/reviews/hotel/{hotelId} */
    @PostMapping("/tourist/reviews/hotel/{hotelId}")
    public ResponseEntity<ReviewResponse> addHotelReview(
            @PathVariable Long hotelId,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.addHotelReview(hotelId, request));
    }
}
