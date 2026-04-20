package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Teammate's existing methods — keep these!
    List<Review> findByPkgId(Long packageId);
    List<Review> findByHotelId(Long hotelId);
    List<Review> findByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.pkg.id = :packageId")
    Double getAverageRatingByPackageId(@Param("packageId") Long packageId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.pkg.id = :packageId")
    Long getReviewCountByPackageId(@Param("packageId") Long packageId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double getAverageRatingByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    Long getReviewCountByHotelId(@Param("hotelId") Long hotelId);

    // Your new methods — added below
    List<Review> findByAgentId(Long agentId);
    List<Review> findByAgentIdAndRating(Long agentId, Integer rating);
}