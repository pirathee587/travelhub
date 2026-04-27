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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;

    @Value("${supabase.storage.url}")
    private String supabaseStorageUrl;

    @Value("${supabase.storage.public-url}")
    private String publicUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.review-bucket}")
    private String reviewBucketName;

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
                .userName(request.getUserName())
                .title(request.getTitle())
                .comment(request.getComment())
                .rating(request.getRating())
                .imageUrls(request.getImageUrls() != null ?
                        String.join(",", request.getImageUrls()) : null)
                .build();

        Review saved = reviewRepository.save(review);
        return toReviewResponse(saved);
    }

    // Submit review for a hotel
    public ReviewResponse addHotelReview(Long hotelId, ReviewRequest request) {

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
                .userName(request.getUserName())
                .title(request.getTitle())
                .comment(request.getComment())
                .rating(request.getRating())
                .imageUrls(request.getImageUrls() != null ?
                        String.join(",", request.getImageUrls()) : null)
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
                .imageUrls(review.getImageUrls() != null ?
                        Arrays.asList(review.getImageUrls().split(",")) : null)
                .build();
    }

    // Upload Image to Supabase Storage
    public String uploadImage(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String uploadUrl = supabaseStorageUrl + "/" + reviewBucketName + "/" + fileName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.valueOf(file.getContentType()));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            return publicUrl + "/" + reviewBucketName + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }
}