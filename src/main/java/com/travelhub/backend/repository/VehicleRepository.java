package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // Your methods
    List<Vehicle> findByAgentId(Long agentId);
    List<Vehicle> findByAgentIdAndLifecycleStatus(Long agentId, String lifecycleStatus);
    List<Vehicle> findByAgentIdAndStatus(Long agentId, String status);
    boolean existsByRegistration(String registration);
}