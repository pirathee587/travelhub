package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * VehicleRepository provides data access methods for managing transport vehicles.
 * It supports filtering by agent ownership, lifecycle status, and real-time operational status.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Retrieves all vehicles managed by a specific agent
    List<Vehicle> findByAgentId(Long agentId);
    
    // Retrieves vehicles for an agent filtered by their system lifecycle status (e.g., "active", "deleted")
    List<Vehicle> findByAgentIdAndLifecycleStatus(Long agentId, String lifecycleStatus);
    
    // Retrieves vehicles for an agent filtered by their current operational status (e.g., "available", "on-trip")
    List<Vehicle> findByAgentIdAndStatus(Long agentId, String status);
    
    // Checks if a vehicle with the given registration (license plate) already exists in the system
    boolean existsByRegistration(String registration);
}