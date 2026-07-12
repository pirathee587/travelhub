package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    // Get all drivers belonging to a specific agent
    List<Driver> findByAgentId(Long agentId);

    // Get drivers by agent and lifecycle status (active/suspended)
    List<Driver> findByAgentIdAndLifecycleStatus(Long agentId, String lifecycleStatus);

    // Get drivers by agent and status (available/on-trip/off-duty)
    List<Driver> findByAgentIdAndStatus(Long agentId, String status);

    // Check if NIC already exists
    boolean existsByNic(String nic);

    // Check if license already exists
    boolean existsByLicenseNumber(String licenseNumber);
}