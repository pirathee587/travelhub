package com.travelhub.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.dto.request.ReviewRequest;
import com.travelhub.backend.dto.response.ReviewResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.entity.ReviewImage;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewImageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;

/**
 * ReviewService manages the submission and retrieval of customer feedback.
 * It supports reviews for both travel packages and hotels, including star ratings and image galleries.
 */
@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ImageUploadService imageUploadService;

    /**
     * Constructor injection for all required data and multimedia services.
     */
    public ReviewService(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            PackageRepository packageRepository,
            HotelRepository hotelRepository,
            ReviewImageRepository reviewImageRepository,
            ImageUploadService imageUploadService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
        this.hotelRepository = hotelRepository;
        this.reviewImageRepository = reviewImageRepository;
        this.imageUploadService = imageUploadService;
    }

    /**
     * Retrieves all reviews associated with a specific travel package.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getPackageReviews(Long packageId) {
        return reviewRepository.findByPkg_Id(packageId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all reviews associated with a specific hotel.
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getHotelReviews(Long hotelId) {
        return reviewRepository.findByHotel_Id(hotelId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    /**
     * Submits a new review for a travel package.
     * Handles file uploads for review images and links them to the review entity.
     */
    @Transactional
    public ReviewResponse addPackageReview(Long packageId, ReviewRequest request, List<org.springframework.web.multipart.MultipartFile> images) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found: " + packageId));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        // Initialize the review entity
        Review review = new Review();
        review.setUser(user);
        review.setPkg(pkg);
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setUserName(request.getUserName());

        Review saved = reviewRepository.save(review);

        // Process and upload attached images
        if (images != null && !images.isEmpty()) {
            for (org.springframework.web.multipart.MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = imageUploadService.uploadReviewImage(file).getImageUrl();
                        ReviewImage img = new ReviewImage();
                        img.setReview(saved);
                        img.setImageUrl(imageUrl);
                        reviewImageRepository.save(img);
                        
                        // Maintain the bidirectional relationship in-memory
                        if (saved.getImages() == null) {
                            saved.setImages(new ArrayList<>());
                        }
                        saved.getImages().add(img);
                    } catch (Exception e) {
                        log.error("Failed to upload image for review {}", saved.getId(), e);
                        throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
                    }
                }
            }
        }
        
        return toReviewResponse(saved);
    }

    /**
     * Submits a new review for a hotel property.
     * Similar logic to package reviews, but linked to a Hotel entity.
     */
    @Transactional
    public ReviewResponse addHotelReview(Long hotelId, ReviewRequest request, List<org.springframework.web.multipart.MultipartFile> images) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found: " + hotelId));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        Review review = new Review();
        review.setUser(user);
        review.setHotel(hotel);
        review.setComment(request.getComment());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setUserName(request.getUserName());

        Review saved = reviewRepository.save(review);

        if (images != null && !images.isEmpty()) {
            for (org.springframework.web.multipart.MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = imageUploadService.uploadReviewImage(file).getImageUrl();
                        ReviewImage img = new ReviewImage();
                        img.setReview(saved);
                        img.setImageUrl(imageUrl);
                        reviewImageRepository.save(img);
                        if (saved.getImages() == null) {
                            saved.setImages(new ArrayList<>());
                        }
                        saved.getImages().add(img);
                    } catch (Exception e) {
                        log.error("Failed to upload image for hotel review {}", saved.getId(), e);
                        throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
                    }
                }
            }
        }
        
        return toReviewResponse(saved);
    }

    /**
     * Calculates the average star rating for a package, rounded to 1 decimal.
     */
    public double getAveragePackageRating(Long packageId) {
        Double avg = reviewRepository.getAverageRatingByPackageId(packageId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    /**
     * Returns the total count of reviews left for a specific package.
     */
    public long getPackageReviewCount(Long packageId) {
        Long count = reviewRepository.getReviewCountByPackageId(packageId);
        return count != null ? count : 0L;
    }

    /**
     * Calculates the average star rating for a hotel, rounded to 1 decimal.
     */
    public double getAverageHotelRating(Long hotelId) {
        Double avg = reviewRepository.getAverageRatingByHotelId(hotelId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    /**
     * Returns the total count of reviews left for a specific hotel.
     */
    public long getHotelReviewCount(Long hotelId) {
        Long count = reviewRepository.getReviewCountByHotelId(hotelId);
        return count != null ? count : 0L;
    }

    /**
     * Maps a Review entity to a comprehensive response DTO.
     * Resolves display names (real name vs custom string) and compiles the gallery image URLs.
     */
    private ReviewResponse toReviewResponse(Review review) {
        String displayName = "Anonymous";
        if (review.getUser() != null && review.getUser().getName() != null) {
            displayName = review.getUser().getName();
        } else if (review.getUserName() != null && !review.getUserName().isBlank()) {
            displayName = review.getUserName();
        }

        String dateStr = review.getReviewDate() != null
                ? review.getReviewDate().toLocalDate().toString()
                : null;

        List<String> imageUrls = null;
        if (review.getImages() != null) {
            imageUrls = review.getImages().stream()
                    .map(ReviewImage::getImageUrl)
                    .collect(Collectors.toList());
        }
        
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserName(displayName);
        response.setReviewDate(dateStr);
        response.setRating(review.getRating());
        response.setTitle(review.getTitle());
        response.setComment(review.getComment());
        response.setImageUrls(imageUrls);
        response.setCustomerName(displayName);
        response.setDate(dateStr);
        // Link to destination if it was a package review
        response.setTrip(review.getPkg() != null ? review.getPkg().getDestination() : null);
        response.setPackageName(review.getPkg() != null ? review.getPkg().getPackageName() : null);
        response.setReply(review.getReply());
        response.setHasReply(review.getReply() != null && !review.getReply().isEmpty());
        return response;
    }
}