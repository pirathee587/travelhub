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
    List<Package> findByAgentId(Long agentId);
    List<Package> findByApplicationStatus(String applicationStatus);

    // ── New methods (added for agent package management) ──────────────────
    Long countByAgentId(Long agentId);

    // Find agent's packages excluding soft-deleted
    List<Package> findByAgentIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long agentId);

    // Find with isActive filter
    List<Package> findByAgentIdAndIsActiveAndDeletedAtIsNullOrderByCreatedAtDesc(
            Long agentId, Boolean isActive);

    // Find by human-readable packageId (e.g. PKG001)
    Optional<Package> findByPackageIdAndDeletedAtIsNull(String packageId);

    // Search by name or destination
    @Query("SELECT p FROM Package p WHERE p.agent.id = :agentId " +
            "AND p.deletedAt IS NULL " +
            "AND (LOWER(p.packageName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.destination) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Package> searchByAgentId(@Param("agentId") Long agentId,
                                  @Param("search") String search);

    // For generating PKG001, PKG002 etc.
    @Query("SELECT COUNT(p) FROM Package p")
    Long countAll();
}