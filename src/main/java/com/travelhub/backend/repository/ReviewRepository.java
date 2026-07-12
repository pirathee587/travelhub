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

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = { "pkg", "user" })
    List<Review> findByPkg_Id(Long packageId);

    @EntityGraph(attributePaths = {"pkg", "user"})
    List<Review> findByHotel_Id(Long hotelId);

    @EntityGraph(attributePaths = {"pkg", "user"})
    List<Review> findByUser_Id(Long userId);

    // ── Single-entity queries (for detail pages) ─────

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.pkg.id = :packageId")
    Double getAverageRatingByPackageId(@Param("packageId") Long packageId);     //Average rating for package

    @Query("SELECT COUNT(r) FROM Review r WHERE r.pkg.id = :packageId")
    Long getReviewCountByPackageId(@Param("packageId") Long packageId);          //Number of reviews for package

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double getAverageRatingByHotelId(@Param("hotelId") Long hotelId);          //Average rating for hotel

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    Long getReviewCountByHotelId(@Param("hotelId") Long hotelId);               //Number of reviews for hotel

    // ── Bulk queries (for list pages — eliminates N+1) ─────

    @Query("SELECT r.pkg.id, AVG(r.rating) FROM Review r WHERE r.pkg.id IN :packageIds GROUP BY r.pkg.id")
    List<Object[]> getAverageRatingsByPackageIdsRaw(@Param("packageIds") List<Long> packageIds);

    @Query("SELECT r.pkg.id, COUNT(r) FROM Review r WHERE r.pkg.id IN :packageIds GROUP BY r.pkg.id")
    List<Object[]> getReviewCountsByPackageIdsRaw(@Param("packageIds") List<Long> packageIds);

    @Query("SELECT r.hotel.id, AVG(r.rating) FROM Review r WHERE r.hotel.id IN :hotelIds GROUP BY r.hotel.id")
    List<Object[]> getAverageRatingsByHotelIdsRaw(@Param("hotelIds") List<Long> hotelIds);

    @Query("SELECT r.hotel.id, COUNT(r) FROM Review r WHERE r.hotel.id IN :hotelIds GROUP BY r.hotel.id")
    List<Object[]> getReviewCountsByHotelIdsRaw(@Param("hotelIds") List<Long> hotelIds);

    // ── Convenience methods that return Maps ─────

    default Map<Long, Double> getAverageRatingsByPackageIds(List<Long> packageIds) {
        return getAverageRatingsByPackageIdsRaw(packageIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]
                ));
    }

    default Map<Long, Long> getReviewCountsByPackageIds(List<Long> packageIds) {
        return getReviewCountsByPackageIdsRaw(packageIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    default Map<Long, Double> getAverageRatingsByHotelIds(List<Long> hotelIds) {
        return getAverageRatingsByHotelIdsRaw(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]
                ));
    }

    default Map<Long, Long> getReviewCountsByHotelIds(List<Long> hotelIds) {
        return getReviewCountsByHotelIdsRaw(hotelIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    // ── Agent queries ────────────────────────────────

    @EntityGraph(attributePaths = {"pkg", "user"})
    @Query("SELECT r FROM Review r WHERE r.agent.id = :agentId OR (r.pkg IS NOT NULL AND r.pkg.agent.id = :agentId)")
    List<Review> findByAgent_Id(@Param("agentId") Long agentId);

    @EntityGraph(attributePaths = {"pkg", "user"})
    @Query("SELECT r FROM Review r WHERE (r.agent.id = :agentId OR (r.pkg IS NOT NULL AND r.pkg.agent.id = :agentId)) AND r.rating = :rating")
    List<Review> findByAgent_IdAndRating(@Param("agentId") Long agentId, @Param("rating") Integer rating);

    // ── Agent rating aggregation (computed from package reviews) ──

    /**
     * Computes the agent's rating as AVG of all review ratings across all packages
     * belonging to the agent. Single DB query — no N+1.
     * Returns null if the agent has no reviewed packages.
     */
    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.pkg.agent.id = :agentId
          AND r.pkg IS NOT NULL
    """)
    Double getAverageRatingByAgentId(@Param("agentId") Long agentId);

    /**
     * Bulk variant: returns [agentId, avgRating] rows for all agents in the list.
     * Used on the agents list page to avoid N+1 (one query total).
     */
    @Query("""
        SELECT r.pkg.agent.id, AVG(r.rating)
        FROM Review r
        WHERE r.pkg.agent.id IN :agentIds
          AND r.pkg IS NOT NULL
        GROUP BY r.pkg.agent.id
    """)
    List<Object[]> getAverageRatingsByAgentIdsRaw(@Param("agentIds") List<Long> agentIds);

    default Map<Long, Double> getAverageRatingsByAgentIds(List<Long> agentIds) {
        if (agentIds == null || agentIds.isEmpty()) return new HashMap<>();
        return getAverageRatingsByAgentIdsRaw(agentIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]
                ));
    }
}