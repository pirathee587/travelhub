package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.*;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAgentAnalyticsService {

    private final AgentRepository   agentRepository;
    private final BookingRepository bookingRepository;

    // ── Get All Agents List ───────────────────────────
    // Admin portal-ல் எல்லா agents பட்டியல்
    public List<AdminAgentListResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Get Agent Stats ───────────────────────────────
    // ஒரு agent-இன் 4 cards data
    // Total Revenue, Total Trips,
    // Average Rating, Cancellation Rate
    public AdminAgentStatsResponse getAgentStats(
            Long agentId) {

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", agentId));

        // Total Revenue
        Double totalRevenue = agentRepository
                .getTotalRevenueByAgentId(agentId);

        // Total Trips
        Long totalTrips = agentRepository
                .getTotalTripsByAgentId(agentId);

        // Average Rating
        Double avgRating = agentRepository
                .getAvgRatingByAgentId(agentId);

        // Cancellation Rate calculation
        // cancelled / total * 100
        Long cancelledTrips = agentRepository
                .getCancelledTripsByAgentId(agentId);

        Double cancellationRate = 0.0;
        if (totalTrips != null && totalTrips > 0
                && cancelledTrips != null) {
            cancellationRate = Math.round(
                    (cancelledTrips.doubleValue()
                            / totalTrips.doubleValue() * 100)
                            * 10.0) / 10.0;
        }

        return new AdminAgentStatsResponse(
                agent.getId(),
                agent.getAgencyName(),
                agent.getAgencyName(),
                agent.getRating(),
                totalRevenue  != null ? totalRevenue  : 0.0,
                totalTrips    != null ? totalTrips    : 0L,
                avgRating     != null
                        ? Math.round(avgRating * 10.0)
                        / 10.0
                        : 0.0,
                cancellationRate
        );
    }

    // ── Get Monthly Revenue ───────────────────────────
    // Chart data — J,F,M,A,M,J,J,A,S,O,N,D
    public AdminAgentMonthlyRevenueResponse
    getMonthlyRevenue(Long agentId, int year) {

        agentRepository.findById(agentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", agentId));

        List<String> labels = List.of(
                "J","F","M","A","M","J",
                "J","A","S","O","N","D");

        List<Double> data = new ArrayList<>();

        // ஒவ்வொரு month-க்கும் revenue எடுக்கிறோம்
        for (int month = 1; month <= 12; month++) {
            Double revenue = agentRepository
                    .getMonthlyRevenueByAgentId(
                            agentId, month, year);
            data.add(revenue != null ? revenue : 0.0);
        }

        return new AdminAgentMonthlyRevenueResponse(
                "Monthly",
                labels,
                data
        );
    }

    // ── Get Trip Status ───────────────────────────────
    // Pie chart — Completed, Pending, Cancelled
    public AdminAgentTripStatusResponse
    getTripStatus(Long agentId) {

        agentRepository.findById(agentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", agentId));

        Long completed = bookingRepository
                .countByAgentIdAndStatus(
                        agentId, "completed");
        Long pending = bookingRepository
                .countByAgentIdAndStatus(
                        agentId, "pending");
        Long cancelled = bookingRepository
                .countByAgentIdAndStatus(
                        agentId, "cancelled");

        return new AdminAgentTripStatusResponse(
                completed != null ? completed : 0L,
                pending   != null ? pending   : 0L,
                cancelled != null ? cancelled : 0L
        );
    }

    // ── Map Agent → List Response ─────────────────────
    private AdminAgentListResponse mapToListResponse(
            Agent a) {
        return new AdminAgentListResponse(
                a.getId(),
                a.getOwner() != null ? a.getOwner().getId() : null,
                a.getAgencyName(),
                a.getAgencyName(),
                a.getOwner() != null ? a.getOwner().getName() : null,
                a.getOwner() != null ? a.getOwner().getEmail() : null,
                a.getAgencyNumber() != null ? a.getAgencyNumber() : (a.getOwner() != null ? a.getOwner().getTelephone() : null),
                a.getLocation(),
                a.getOwner() != null && a.getOwner().getAgentApproved() != null && a.getOwner().getAgentApproved() ? "Approved" : ("REJECTED".equalsIgnoreCase(a.getOwner() != null ? a.getOwner().getStatus() : null) ? "Rejected" : "Pending"),
                a.getSubmittedDate() != null ? a.getSubmittedDate().toString() : null,
                a.getIsActive() != null && a.getIsActive()
        );
    }
}
