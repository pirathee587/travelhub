package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {

    // ── Existing methods (kept as-is) ─────────────────────────────────────
    List<Package> findByIsActiveTrue();
    List<Package> findByCategory(String category);
    List<Package> findByTrendingTrue();

    /** Finds packages by the agent's surrogate PK (agents.id). */
    List<Package> findByAgent_Id(Long agentId);
    List<Package> findByApplicationStatus(String applicationStatus);

    // ── New methods (added for agent package management) ──────────────────
    Long countByAgent_Id(Long agentId);

    // Find agent's packages excluding soft-deleted
    List<Package> findByAgent_IdAndDeletedAtIsNullOrderByCreatedAtDesc(Long agentId);

    // Find with isActive filter
    List<Package> findByAgent_IdAndIsActiveAndDeletedAtIsNullOrderByCreatedAtDesc(
            Long agentId, Boolean isActive);

    // Find by human-readable packageId (e.g. PKG001)
    Optional<Package> findByPackageIdAndDeletedAtIsNull(String packageId);

    // Search by name or destination
    @Query("SELECT p FROM Package p WHERE p.agent.id = :agentId " +
            "AND p.deletedAt IS NULL " +
            "AND (LOWER(p.packageName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.district) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Package> searchByAgentId(@Param("agentId") Long agentId,
                                  @Param("search") String search);

    // ── Chatbot global search ─────────────────────────────────────────────
    // Searches all active packages across all agents by keyword
    @Query("SELECT p FROM Package p WHERE p.isActive = true " +
            "AND p.deletedAt IS NULL " +
            "AND (LOWER(p.packageName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.district) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.endPlace) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Package> searchActivePackagesByKeyword(@Param("keyword") String keyword);

    /**
     * Finds packages by the value stored in packages.agent_id column
     * (which equals agents.user_id due to the @JoinColumn referencedColumnName).
     * Use this when you have the agent's user_id, not the surrogate id.
     */
    @Query(value = "SELECT * FROM packages WHERE agent_id = :agentUserId", nativeQuery = true)
    List<Package> findByAgentUserId(@Param("agentUserId") Long agentUserId);

    // ── Dynamic District Map queries ──────────────────────────────────────
    @Query("SELECT DISTINCT p.district FROM Package p " +
           "WHERE p.isActive = true " +
           "AND p.deletedAt IS NULL " +
           "AND p.applicationStatus = 'Approved' " +
           "AND p.district IS NOT NULL " +
           "AND TRIM(p.district) <> ''")
    List<String> findDistinctDistricts();

    @Query("SELECT p FROM Package p " +
           "WHERE LOWER(p.district) = LOWER(:district) " +
           "AND p.isActive = true " +
           "AND p.deletedAt IS NULL " +
           "AND p.applicationStatus = 'Approved'")
    List<Package> findActivePackagesByDistrict(@Param("district") String district);
}