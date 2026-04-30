package com.travelhub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelhub.backend.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ✅ FIXED: was findByPkgId — but the entity field is `pkg`, so it must be findByPkg_Id
    List<Review> findByPkg_Id(Long packageId);

    List<Review> findByHotelId(Long hotelId);

    List<Review> findByUserId(Long userId);

    // ✅ FIXED: JPQL references entity field `pkg`, not column `package_id`
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.pkg.id = :packageId")
    Double getAverageRatingByPackageId(@Param("packageId") Long packageId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.pkg.id = :packageId")
    Long getReviewCountByPackageId(@Param("packageId") Long packageId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double getAverageRatingByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    Long getReviewCountByHotelId(@Param("hotelId") Long hotelId);

    List<Review> findByAgent_Id(Long agentId);
    List<Review> findByAgent_IdAndRating(Long agentId, Integer rating);
}