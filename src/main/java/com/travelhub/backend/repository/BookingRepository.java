package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Existing methods (keep these — teammates use them)
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserIdAndStatus(Long userId, String status);

    // Your new methods for agent dashboard
    List<Booking> findByVehicleAgentId(Long agentId);
    List<Booking> findByVehicleAgentIdAndStatus(Long agentId, String status);
}