package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * PackageRepository provides data access methods for travel packages.
 * It supports filtering by status, category, agent, and trending flags.
 */
@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    
    // Retrieves all packages that are currently marked as active and visible to users
    List<Package> findByIsActiveTrue();
    
    // Retrieves packages belonging to a specific category (e.g., "Adventure", "Beach")
    List<Package> findByCategory(String category);
    
    // Retrieves packages that are currently flagged as trending
    List<Package> findByTrendingTrue();
    
    // Retrieves all packages created by a specific agent
    List<Package> findByAgentId(Long agentId);

    // Retrieves packages based on their admin approval status (e.g., "Pending", "Approved")
    List<Package> findByApplicationStatus(String applicationStatus);
}