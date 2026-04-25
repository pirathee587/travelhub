package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.BookingRepository;
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
    private final BookingRepository bookingRepository;

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

        // Check booking exists and completed
        List<Booking> bookings = bookingRepository.findByUserId(request.getUserId());
        boolean hasBooked = bookings.stream()
                .anyMatch(b -> b.getPkg().getId().equals(packageId)
                        && b.getStatus().equals("completed"));

        if (!hasBooked) {
            throw new RuntimeException(
                    "You can only review packages you have completed booking!");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Review review = Review.builder()
                .user(user)
                .pkg(pkg)
                .comment(request.getComment())
                .rating(request.getRating())
                .build();

        Review saved = reviewRepository.save(review);
        return toReviewResponse(saved);
    }

    // Submit review for a hotel
    public ReviewResponse addHotelReview(Long hotelId, ReviewRequest request) {

        // Check booking exists and completed
        List<Booking> bookings = bookingRepository.findByUserId(request.getUserId());
        boolean hasBooked = bookings.stream()
                .anyMatch(b -> b.getHotel() != null
                        && b.getHotel().getId().equals(hotelId)
                        && b.getStatus().equals("completed"));

        if (!hasBooked) {
            throw new RuntimeException(
                    "You can only review hotels you have stayed in!");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
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
                .customerName(review.getUser() != null ? review.getUser().getName() : "Anonymous")
                .comment(review.getComment())
                .rating(review.getRating())
                .date(review.getCreatedAt() != null ? review.getCreatedAt().toLocalDate().toString() : null)
                .trip(review.getPkg() != null ? review.getPkg().getDestination() : null)
                .packageName(review.getPkg() != null ? review.getPkg().getPackageName() : null)
                .reply(review.getReply())
                .hasReply(review.getReply() != null && !review.getReply().isEmpty())
                .build();
    }
}
