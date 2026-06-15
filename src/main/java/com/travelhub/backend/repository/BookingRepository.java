package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * BookingRepository provides data access methods for the Booking entity.
 * It includes queries for tourists, agents, and vehicle-specific booking management.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ── Tourist (User) Queries ──────────────────────────
    
    // Retrieves all bookings made by a specific user (tourist)
    List<Booking> findByUserId(Long userId);
    
    // Retrieves bookings for a specific user filtered by their status (e.g., "confirmed", "cancelled")
    List<Booking> findByUserIdAndStatus(Long userId, String status);
    
    // Counts the number of bookings for a specific user with a specific status
    Long countByUserIdAndStatus(Long userId, String status);

    // ── Agent Queries ───────────────────────────────────
    
    // Retrieves all bookings associated with packages managed by a specific agent
    @Query("SELECT b FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId")
    List<Booking> findByAgentId(@Param("agentId") Long agentId);

    // Retrieves bookings for an agent's packages, filtered by status
    @Query("SELECT b FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND b.status = :status")
    List<Booking> findByAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    // Counts bookings for an agent's packages with a specific status
    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND b.status = :status")
    Long countByAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    // ── Vehicle Agent Queries ───────────────────────────
    
    // Retrieves all bookings where the assigned vehicle belongs to a specific agent
    @Query("SELECT b FROM Booking b " +
            "JOIN b.vehicle v " +
            "WHERE v.agent.id = :agentId")
    List<Booking> findByVehicleAgentId(@Param("agentId") Long agentId);

    // Retrieves bookings for a vehicle owner's vehicles, filtered by status
    @Query("SELECT b FROM Booking b " +
            "JOIN b.vehicle v " +
            "WHERE v.agent.id = :agentId " +
            "AND b.status = :status")
    List<Booking> findByVehicleAgentIdAndStatus(
            @Param("agentId") Long agentId,
            @Param("status") String status);

    // ── General Global Queries ──────────────────────────
    
    // Counts the total number of bookings across the system with a specific status
    Long countByStatus(String status);
    
    // Retrieves all bookings in the system with a specific status
    List<Booking> findByStatus(String status);
}
