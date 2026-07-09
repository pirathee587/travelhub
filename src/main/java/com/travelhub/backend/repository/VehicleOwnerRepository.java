package com.travelhub.backend.repository;

import com.travelhub.backend.entity.VehicleOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleOwnerRepository extends JpaRepository<VehicleOwner, Long> {
    List<VehicleOwner> findByAgentId(Long agentId);
    Optional<VehicleOwner> findByNicNumber(String nicNumber);
}
