package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByAgentId(Long agentId);
    List<Vehicle> findByIsAvailableTrue();
}
