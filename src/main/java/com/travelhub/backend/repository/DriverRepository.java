package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * DriverRepository provides data access methods for the Driver entity.
 * It includes methods for agent-specific driver management and validation of unique identifiers.
 */
@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    // Retrieves all drivers employed or managed by a specific agent
    List<Driver> findByAgentId(Long agentId);

    // Retrieves drivers for an agent filtered by their system lifecycle status (e.g., "active", "suspended")
    List<Driver> findByAgentIdAndLifecycleStatus(Long agentId, String lifecycleStatus);

    // Retrieves drivers for an agent filtered by their current operational status (e.g., "available", "on-trip")
    List<Driver> findByAgentIdAndStatus(Long agentId, String status);

    // Checks if a driver with the given NIC (National Identity Card) already exists in the system
    boolean existsByNic(String nic);

    // Checks if a driver with the given license number already exists in the system
    boolean existsByLicenseNumber(String licenseNumber);
}