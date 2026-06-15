package com.travelhub.backend.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelhub.backend.entity.Review;

/**
 * ReviewRepository provides data access methods for user feedback.
 * It includes performance-optimized queries for ratings, review counts, and bulk statistics.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Retrieves reviews for a specific package, eager-loading package and user details to avoid N+1 issues
    @EntityGraph(attributePaths = {"pkg", "user"})
    List<Review> findByPkg_Id(Long packageId);

    // Retrieves reviews for a specific hotel, eager-loading related entities
    @EntityGraph(attributePaths = {"pkg", "user"})
    List<Review> findByHotel_Id(Long hotelId);

    // Retrieves all reviews written by a specific user
    @EntityGraph(attributePaths = {"pkg", "user"})
    List<Review> findByUser_Id(Long userId);

    // ── Single-entity queries (for detail pages) ─────

    // Calculates the average rating for a specific travel package
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.pkg.id = :packageId")
    Double getAverageRatingByPackageId(@Param("packageId") Long packageId);

    // Counts the total number of reviews for a specific travel package
    @Query("SELECT COUNT(r) FROM Review r WHERE r.pkg.id = :packageId")
    Long getReviewCountByPackageId(@Param("packageId") Long packageId);

    // Calculates the average rating for a specific hotel
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double getAverageRatingByHotelId(@Param("hotelId") Long hotelId);

    // Counts the total number of reviews for a specific hotel
    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    Long getReviewCountByHotelId(@Param("hotelId") Long hotelId);

    // ── Bulk queries (for list pages — eliminates N+1) ─────

    // Retrieves average ratings for multiple packages at once, returned as raw object arrays [pkgId, avgRating]
    @Query("SELECT r.pkg.id, AVG(r.rating) FROM Review r WHERE r.pkg.id IN :packageIds GROUP BY r.pkg.id")
    List<Object[]> getAverageRatingsByPackageIdsRaw(@Param("packageIds") List<Long> packageIds);

    // Retrieves review counts for multiple packages at once
    @Query("SELECT r.pkg.id, COUNT(r) FROM Review r WHERE r.pkg.id IN :packageIds GROUP BY r.pkg.id")
    List<Object[]> getReviewCountsByPackageIdsRaw(@Param("packageIds") List<Long> packageIds);

    // Retrieves average ratings for multiple hotels at once
    @Query("SELECT r.hotel.id, AVG(r.rating) FROM Review r WHERE r.hotel.id IN :hotelIds GROUP BY r.hotel.id")
    List<Object[]> getAverageRatingsByHotelIdsRaw(@Param("hotelIds") List<Long> hotelIds);

    // Retrieves review counts for multiple hotels at once
    @Query("SELECT r.hotel.id, COUNT(r) FROM Review r WHERE r.hotel.id IN :hotelIds GROUP BY r.hotel.id")
    List<Object[]> getReviewCountsByHotelIdsRaw(@Param("hotelIds") List<Long> hotelIds);

    // ── Convenience methods that return Maps ─────

    // Converts raw package rating results into a convenient Map of {packageId -> averageRating}
    default Map<Long, Double> getAverageRatingsByPackageIds(List<Long> packageIds) {
        return getAverageRatingsByPackageIdsRaw(packageIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]
                ));
    }

    // Converts raw package review count results into a convenient Map of {packageId -> reviewCount}
    default Map<Long, Long> getReviewCountsByPackageIds(List<Long> packageIds) {
        return getReviewCountsByPackageIdsRaw(packageIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    // Converts raw hotel rating results into a convenient Map of {hotelId -> averageRating}
    default Map<Long, Double> getAverageRatingsByHotelIds(List<Long> hotelIds) {
        return getAverageRatingsByHotelIdsRaw(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]
                ));
    }

    // Converts raw hotel review count results into a convenient Map of {hotelId -> reviewCount}
    default Map<Long, Long> getReviewCountsByHotelIds(List<Long> hotelIds) {
        return getReviewCountsByHotelIdsRaw(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    // ── Agent queries ────────────────────────────────

    // Retrieves all reviews associated with an agent (reviews for any of their packages)
    List<Review> findByAgent_Id(Long agentId);
    
    // Retrieves reviews for an agent filtered by a specific rating (e.g., finding all 1-star reviews)
    List<Review> findByAgent_IdAndRating(Long agentId, Integer rating);
}