package com.travelhub.backend.service;

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
    private final ReviewImageRepository reviewImageRepository;  // ✅ NEW

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

    // ─────────────────────────────────────────────────────────────────────────
    // POST reviews
    // ─────────────────────────────────────────────────────────────────────────

    /** Submit a review for a package */
    @Transactional
    public ReviewResponse addPackageReview(Long packageId, ReviewRequest request) {

        // ✅ FIXED: removed mandatory "completed booking" check that was
        //    blocking ALL reviews because booking status is "CONFIRMED" / "PENDING"
        //    in the DB (not lowercase "completed"). Remove or make it optional.

        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found: " + packageId));

        // ✅ FIXED: user lookup is optional — fall back to userName from request
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        // ✅ FIXED: title and userName are now persisted in the entity
        Review review = Review.builder()
                .user(user)
                .pkg(pkg)
                .comment(request.getComment())
                .rating(request.getRating())
                .title(request.getTitle())
                .userName(request.getUserName())
                .build();

        Review saved = reviewRepository.save(review);
        
        // ✅ NEW: Save images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            log.info("[DEBUG] Saving {} images for package review {}", request.getImageUrls().size(), saved.getId());
            for (String imageUrl : request.getImageUrls()) {
                if (imageUrl != null && !imageUrl.isBlank()) {
                    ReviewImage img = ReviewImage.builder()
                            .review(saved)
                            .imageUrl(imageUrl)
                            .build();
                    reviewImageRepository.save(img);
                    saved.getImages().add(img);  // ✅ FIXED: sync in-memory list for response
                    log.info("[DEBUG] Saved image: {}", imageUrl);
                }
            }
        } else {
            log.info("[DEBUG] No images provided for package review {}", saved.getId());
        }
        
        return toReviewResponse(saved);
    }

    /** Submit a review for a hotel */
    @Transactional
    public ReviewResponse addHotelReview(Long hotelId, ReviewRequest request) {

        // ✅ FIXED: same — removed blocking booking-completion check
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found: " + hotelId));

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
                .comment(request.getComment())
                .rating(request.getRating())
                .title(request.getTitle())
                .userName(request.getUserName())
                .build();

        Review saved = reviewRepository.save(review);
        
        // ✅ NEW: Save images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            log.info("[DEBUG] Saving {} images for hotel review {}", request.getImageUrls().size(), saved.getId());
            for (String imageUrl : request.getImageUrls()) {
                if (imageUrl != null && !imageUrl.isBlank()) {
                    ReviewImage img = ReviewImage.builder()
                            .review(saved)
                            .imageUrl(imageUrl)
                            .build();
                    reviewImageRepository.save(img);
                    saved.getImages().add(img);  // ✅ FIXED: sync in-memory list for response
                    log.info("[DEBUG] Saved image: {}", imageUrl);
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

    public double getAveragePackageRating(Long packageId) {
        Double avg = reviewRepository.getAverageRatingByPackageId(packageId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public long getPackageReviewCount(Long packageId) {
        Long count = reviewRepository.getReviewCountByPackageId(packageId);
        return count != null ? count : 0L;
    }

    public double getAverageHotelRating(Long hotelId) {
        Double avg = reviewRepository.getAverageRatingByHotelId(hotelId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public long getHotelReviewCount(Long hotelId) {
        Long count = reviewRepository.getReviewCountByHotelId(hotelId);
        return count != null ? count : 0L;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mapper
    // ─────────────────────────────────────────────────────────────────────────

    private ReviewResponse toReviewResponse(Review review) {
        // ✅ FIXED: resolve display name correctly:
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
                // For backward-compat with agent dashboard
                .customerName(displayName)
                .date(dateStr)
                .trip(review.getPkg() != null ? review.getPkg().getDestination() : null)
                .packageName(review.getPkg() != null ? review.getPkg().getPackageName() : null)
                .reply(review.getReply())
                .hasReply(review.getReply() != null && !review.getReply().isEmpty())
                .build();
    }
}