package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    // ── Existing ──────────────────────────────────────
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserIdAndStatus(
            Long userId, String status);
    Long countByUserIdAndStatus(
            Long userId, String status);




    @Query("SELECT b FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId")
    List<Booking> findByAgentId(
            @Param("agentId") Long agentId);


    @Query("SELECT b FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND b.status = :status")
    List<Booking> findByAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);


    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND b.status = :status")
    Long countByAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    // Vehicle Agent Bookings
    @Query("SELECT b FROM Booking b " +
            "JOIN b.vehicle v " +
            "WHERE v.agent.id = :agentId")
    List<Booking> findByVehicleAgentId(
            @Param("agentId") Long agentId);

    @Query("SELECT b FROM Booking b " +
            "JOIN b.vehicle v " +
            "WHERE v.agent.id = :agentId " +
            "AND b.status = :status")
    List<Booking> findByVehicleAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    Long countByStatus(String status);
    List<Booking> findByStatus(String status);

}
