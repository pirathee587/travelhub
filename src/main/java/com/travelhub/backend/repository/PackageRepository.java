package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByIsActiveTrue();
    List<Package> findByCategory(String category);
    List<Package> findByTrendingTrue();

    /** Finds packages by the agent's surrogate PK (agents.id). */
    List<Package> findByAgentId(Long agentId);

    /**
     * Finds packages by the value stored in packages.agent_id column
     * (which equals agents.user_id due to the @JoinColumn referencedColumnName).
     * Use this when you have the agent's user_id, not the surrogate id.
     */
    @Query(value = "SELECT * FROM packages WHERE agent_id = :agentUserId", nativeQuery = true)
    List<Package> findByAgentUserId(@Param("agentUserId") Long agentUserId);

    List<Package> findByApplicationStatus(
            String applicationStatus);
}