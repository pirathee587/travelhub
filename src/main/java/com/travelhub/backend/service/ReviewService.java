package com.travelhub.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
import com.travelhub.backend.service.UserNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ImageUploadService imageUploadService;  // ✅ NEW: Injected for backend orchestration
    private final UserNotificationService userNotificationService;

    // ─────────────────────────────────────────────────────────────────────────
    // GET reviews
    // ─────────────────────────────────────────────────────────────────────────

    /** Returns all reviews for a package */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getPackageReviews(Long packageId) {
        // ✅ FIXED: was findByPkgId → now findByPkg_Id (matches entity field name)
        return reviewRepository.findByPkg_Id(packageId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    /** Returns all reviews for a hotel */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getHotelReviews(Long hotelId) {
        return reviewRepository.findByHotel_Id(hotelId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    /** Returns all reviews created by a specific user */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepository.findByUser_Id(userId)
                .stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST reviews
    // ─────────────────────────────────────────────────────────────────────────

    /** Submit a review for a package */
    @Transactional
    public ReviewResponse addPackageReview(Long packageId, ReviewRequest request, List<org.springframework.web.multipart.MultipartFile> images) {

        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found: " + packageId));

        // user lookup is optional — fall back to userName from request
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        //  title and userName are now persisted in the entity
        Review review = Review.builder()
                .user(user)
                .pkg(pkg)
                .agent(pkg.getAgent())
                .comment(request.getComment())
                .rating(request.getRating())
                .title(request.getTitle())
                .userName(request.getUserName())
                .build();

        Review saved = reviewRepository.save(review);
        //  Save images if provided (from MultipartFile list)
        if (images != null && !images.isEmpty()) {
            log.info("[DEBUG] Saving {} images for package review {}", images.size(), saved.getId());
            for (org.springframework.web.multipart.MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = imageUploadService.uploadReviewImage(file).getImageUrl();
                        ReviewImage img = ReviewImage.builder()
                                .review(saved)
                                .imageUrl(imageUrl)
                                .build();
                        reviewImageRepository.save(img);
                        saved.getImages().add(img);  // ✅ FIXED: sync in-memory list for response
                        log.info("[DEBUG] Saved image: {}", imageUrl);
                    } catch (Exception e) {
                        log.error("[DEBUG] Failed to upload image for review {}", saved.getId(), e);            //Image save error handle
                        throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
                    }
                }
            }
        } else {
            log.info("[DEBUG] No images provided for package review {}", saved.getId());
        }

        if (saved.getAgent() != null) {
            userNotificationService.notifyAgent(
                saved.getAgent(),
                "review",
                "New Package Review",
                "A tourist left a review on package: " + pkg.getPackageName()
            );
        }
        
        return toReviewResponse(saved);
    }

    /** Submit a review for a hotel */
    @Transactional
    public ReviewResponse addHotelReview(Long hotelId, ReviewRequest request, List<org.springframework.web.multipart.MultipartFile> images) {

        // ✅ FIXED: same — removed blocking booking-completion check
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found: " + hotelId));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        Review review = Review.builder()                //Review Data
                .user(user)
                .hotel(hotel)
                .comment(request.getComment())
                .rating(request.getRating())
                .title(request.getTitle())
                .userName(request.getUserName())
                .build();

        Review saved = reviewRepository.save(review);
        //  Save images if provided (from MultipartFile list)
        if (images != null && !images.isEmpty()) {
            log.info("[DEBUG] Saving {} images for hotel review {}", images.size(), saved.getId());
            for (org.springframework.web.multipart.MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = imageUploadService.uploadReviewImage(file).getImageUrl();
                        ReviewImage img = ReviewImage.builder()
                                .review(saved)
                                .imageUrl(imageUrl)     //ImageUploadService.java ->uploadReviewImage
                                .build();
                        reviewImageRepository.save(img);
                        saved.getImages().add(img);  // ✅ FIXED: sync in-memory list for response
                        log.info("[DEBUG] Saved image: {}", imageUrl);
                    } catch (Exception e) {
                        log.error("[DEBUG] Failed to upload image for hotel review {}", saved.getId(), e);
                        throw new RuntimeException("Image upload failed: " + e.getMessage(), e);   //Image save Error Handle
                    }
                }
            }
        } else {
            log.info("[DEBUG] No images provided for hotel review {}", saved.getId());  
        }
        
        return toReviewResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Average rating helpers (used by PackageService / HotelService)
    // ─────────────────────────────────────────────────────────────────────────


    //Get Package Average Rating
    public double getAveragePackageRating(Long packageId) {
        Double avg = reviewRepository.getAverageRatingByPackageId(packageId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }
    //Get Package Review Count
    public long getPackageReviewCount(Long packageId) {
        Long count = reviewRepository.getReviewCountByPackageId(packageId);
        return count != null ? count : 0L;
    }

    //Get Hotel Average Rating
    public double getAverageHotelRating(Long hotelId) {
        Double avg = reviewRepository.getAverageRatingByHotelId(hotelId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }
    //Get Hotel Review Count
    public long getHotelReviewCount(Long hotelId) {
        Long count = reviewRepository.getReviewCountByHotelId(hotelId);
        return count != null ? count : 0L;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapper
    // ─────────────────────────────────────────────────────────────────────────

    private ReviewResponse toReviewResponse(Review review) {
        //    1. try the User entity name
        //    2. fall back to stored userName from request
        //    3. final fallback "Anonymous"
        String displayName = "Anonymous";
        if (review.getUser() != null && review.getUser().getName() != null) {
            displayName = review.getUser().getName();
        } else if (review.getUserName() != null && !review.getUserName().isBlank()) {
            displayName = review.getUserName();
        }

        // ✅ FIXED: date field — entity now uses `reviewDate` not `createdAt`
        String dateStr = review.getReviewDate() != null
                ? review.getReviewDate().toLocalDate().toString()
                : null;

        // ✅ NEW: Extract imageUrls from the relationship
        List<String> imageUrls = review.getImages() != null
                ? review.getImages().stream()
                    .map(ReviewImage::getImageUrl)
                    .collect(Collectors.toList())
                : null;
        
        log.info("[DEBUG] Review {} has {} images", review.getId(), imageUrls != null ? imageUrls.size() : 0);

        return ReviewResponse.builder()
                .id(review.getId())
                // ✅ Frontend reads `userName` and `reviewDate`
                .userName(displayName)
                .reviewDate(dateStr)
                .rating(review.getRating())
                // ✅ Frontend reads `title`
                .title(review.getTitle())
                .comment(review.getComment())
                // ✅ NEW: Include imageUrls for frontend display
                .imageUrls(imageUrls)
                // For backward-compat with agent dashboard & package reviews
                .customerName(displayName)
                .date(dateStr)
                .trip(review.getPkg() != null ? review.getPkg().getDestination() : null)
                .packageName(review.getPkg() != null ? review.getPkg().getPackageName() : null)
                .packageId(review.getPkg() != null ? review.getPkg().getId() : null)
                // ✅ NEW: Include hotel details for hotel reviews
                .hotelName(review.getHotel() != null ? review.getHotel().getHotelName() : null)
                .hotelId(review.getHotel() != null ? review.getHotel().getId() : null)
                .district(review.getPkg() != null ? review.getPkg().getDistrict() : (review.getHotel() != null ? review.getHotel().getDistrict() : null))
                .reply(review.getReply())
                .hasReply(review.getReply() != null && !review.getReply().isEmpty())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT review (update) - with authorization
    // ─────────────────────────────────────────────────────────────────────────

    /** Update an existing review - only the owner can update */
    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long userId, ReviewRequest request, List<org.springframework.web.multipart.MultipartFile> newImages) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        // ✅ AUTHORIZATION: Verify the logged-in user is the review owner
        if (review.getUser() == null || !review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own reviews");
        }

        // Update allowed fields
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            review.setTitle(request.getTitle());
        }
        if (request.getComment() != null && !request.getComment().isBlank()) {
            review.setComment(request.getComment());
        }

        Review updated = reviewRepository.save(review);

        // Handle image updates: remove old images and add new ones if provided
        if (newImages != null && !newImages.isEmpty()) {
            log.info("[DEBUG] Updating {} images for review {}", newImages.size(), updated.getId());
            
            // Delete old image records from database (files will remain in storage - garbage collection)
            if (updated.getImages() != null && !updated.getImages().isEmpty()) {
                for (ReviewImage oldImg : new ArrayList<>(updated.getImages())) {
                    reviewImageRepository.delete(oldImg);
                    updated.getImages().remove(oldImg);
                    log.info("[DEBUG] Deleted old image record: {}", oldImg.getId());
                }
            }

            // Add new images
            for (org.springframework.web.multipart.MultipartFile file : newImages) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = imageUploadService.uploadReviewImage(file).getImageUrl();
                        ReviewImage img = ReviewImage.builder()
                                .review(updated)
                                .imageUrl(imageUrl)
                                .build();
                        reviewImageRepository.save(img);
                        updated.getImages().add(img);
                        log.info("[DEBUG] Added new image: {}", imageUrl);
                    } catch (Exception e) {
                        log.error("[DEBUG] Failed to upload new image for review {}", updated.getId(), e);
                        throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
                    }
                }
            }
        }

        return toReviewResponse(updated);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE review - with authorization
    // ─────────────────────────────────────────────────────────────────────────

    /** Delete a review - only the owner can delete */
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        // ✅ AUTHORIZATION: Verify the logged-in user is the review owner
        if (review.getUser() == null || !review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own reviews");
        }

        // Delete associated image records from database (files will remain in storage - garbage collection)
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            for (ReviewImage img : review.getImages()) {
                log.info("[DEBUG] Deleting image record: {}", img.getId());
                reviewImageRepository.delete(img);
            }
        }

        // Delete the review (cascade will handle ReviewImage records)
        reviewRepository.delete(review);
        log.info("[DEBUG] Review {} deleted successfully", reviewId);
    }
}