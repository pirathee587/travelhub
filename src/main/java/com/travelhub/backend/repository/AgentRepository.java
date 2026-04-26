package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AgentRepository
        extends JpaRepository<Agent, Long> {

    // ── Existing ──────────────────────────────────────
    Boolean existsByEmail(String email);




    List<Agent> findByIsActiveTrue();


    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) " +
            "FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND b.status = 'completed'")
    Double getTotalRevenueByAgentId(
            @Param("agentId") Long agentId);


    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId")
    Long getTotalTripsByAgentId(
            @Param("agentId") Long agentId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) " +
            "FROM Review r " +
            "WHERE r.pkg.agent.id = :agentId")
    Double getAvgRatingByAgentId(
            @Param("agentId") Long agentId);


    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND b.status = 'cancelled'")
    Long getCancelledTripsByAgentId(
            @Param("agentId") Long agentId);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) " +
            "FROM Booking b " +
            "WHERE b.pkg.agent.id = :agentId " +
            "AND MONTH(b.createdAt) = :month " +
            "AND YEAR(b.createdAt) = :year " +
            "AND b.status = 'completed'")
    Double getMonthlyRevenueByAgentId(
            @Param("agentId") Long agentId,
            @Param("month") int month,
            @Param("year") int year);
}