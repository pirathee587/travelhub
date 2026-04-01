package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;

    // Get reviews for a package
    public List<ReviewResponse> getPackageReviews(Long packageId) {
        return reviewRepository.findByPkgId(packageId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    // Get reviews for a hotel
    public List<ReviewResponse> getHotelReviews(Long hotelId) {
        return reviewRepository.findByHotelId(hotelId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    // Submit review for a package
    public ReviewResponse addPackageReview(Long packageId, ReviewRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Review review = Review.builder()
                .user(user)
                .pkg(pkg)
                .userName(request.getUserName())
                .title(request.getTitle())
                .comment(request.getComment())
                .rating(request.getRating())
                .build();

        Review saved = reviewRepository.save(review);
        return toReviewResponse(saved);
    }

    // Submit review for a hotel
    public ReviewResponse addHotelReview(Long hotelId, ReviewRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
                .userName(request.getUserName())
                .title(request.getTitle())
                .comment(request.getComment())
                .rating(request.getRating())
                .build();

        Review saved = reviewRepository.save(review);
        return toReviewResponse(saved);
    }

    // Map Review → ReviewResponse
    private ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUserName())
                .title(review.getTitle())
                .comment(review.getComment())
                .rating(review.getRating())
                .reviewDate(review.getReviewDate())
                .build();
    }
}