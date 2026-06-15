package com.travelhub.backend.repository;

import com.travelhub.backend.entity.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * ReviewImageRepository provides data access methods for images associated with reviews.
 * It primarily handles retrieving the gallery of images for specific user feedback.
 */
@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
    
    // Retrieves all images associated with a specific review ID
    List<ReviewImage> findByReviewId(Long reviewId);
}
