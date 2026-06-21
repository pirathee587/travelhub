package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    // ── User queries ──────────────────────────────────
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserIdAndStatus(Long userId, String status);
    Long countByUserIdAndStatus(Long userId, String status);

    // ── Agent (package) queries ────────────────────────
    @Query("SELECT b FROM Booking b WHERE b.pkg.agent.id = :agentId")
    List<Booking> findByAgentId(@Param("agentId") Long agentId);

    @Query("SELECT b FROM Booking b WHERE b.pkg.agent.id = :agentId AND b.status = :status")
    List<Booking> findByAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") String status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.pkg.agent.id = :agentId AND b.status = :status")
    Long countByAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") String status);

    // ── Agent (vehicle) queries ────────────────────────
    @Query("SELECT b FROM Booking b JOIN b.vehicle v WHERE v.agent.id = :agentId")
    List<Booking> findByVehicleAgentId(@Param("agentId") Long agentId);

    @Query("SELECT b FROM Booking b JOIN b.vehicle v WHERE v.agent.id = :agentId AND b.status = :status")
    List<Booking> findByVehicleAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") String status);

    // ── Scheduler queries ──────────────────────────────
    // Finds "confirmed" bookings whose startDate is today or earlier
    // Used to notify agent: "Trip [X] is scheduled to start today — please confirm"
    @Query("SELECT b FROM Booking b WHERE b.status = 'confirmed' AND b.startDate <= :today")
    List<Booking> findConfirmedBookingsDueToStart(@Param("today") LocalDate today);

    // Finds "in_progress" bookings whose endDate has already passed
    // Used to notify agent: "Trip [X] should have ended — please mark as complete"
    @Query("SELECT b FROM Booking b WHERE b.status = 'in_progress' AND b.endDate < :today")
    List<Booking> findInProgressBookingsPastEndDate(@Param("today") LocalDate today);

    // ── Admin/global queries ───────────────────────────
    Long countByStatus(String status);
    List<Booking> findByStatus(String status);
}

