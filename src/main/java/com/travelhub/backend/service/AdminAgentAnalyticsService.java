package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.*;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * AdminAgentAnalyticsService provides high-level performance monitoring for all agents.
 * It allows administrators to drill down into specific agent metrics, financial trends, and operational efficiency.
 */
@Service
public class AdminAgentAnalyticsService {

    private final AgentRepository agentRepository;
    private final BookingRepository bookingRepository;

    /**
     * Constructor injection for agent and booking data access.
     */
    public AdminAgentAnalyticsService(AgentRepository agentRepository, BookingRepository bookingRepository) {
        this.agentRepository = agentRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Retrieves a summary list of all agents for administrative monitoring.
     */
    public List<AdminAgentListResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    /**
     * Aggregates core performance metrics for a specific agent.
     * Calculates total revenue, trip volume, average rating, and real-time cancellation rates.
     */
    public AdminAgentStatsResponse getAgentStats(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Aggregate financial performance
        Double totalRevenue = agentRepository.getTotalRevenueByAgentId(agentId);

        // Aggregate operational volume
        Long totalTrips = agentRepository.getTotalTripsByAgentId(agentId);

        // Aggregate quality metrics
        Double avgRating = agentRepository.getAvgRatingByAgentId(agentId);

        // Calculate specialized metrics: Cancellation Rate
        Long cancelledTrips = agentRepository.getCancelledTripsByAgentId(agentId);

        Double cancellationRate = 0.0;
        if (totalTrips != null && totalTrips > 0 && cancelledTrips != null) {
            // Formula: (Cancelled / Total) * 100, rounded to 1 decimal place
            cancellationRate = Math.round((cancelledTrips.doubleValue() / totalTrips.doubleValue() * 100) * 10.0) / 10.0;
        }

        return new AdminAgentStatsResponse(
                agent.getId(),
                agent.getUser().getName(),
                agent.getCompanyName(),
                agent.getRating(),
                totalRevenue  != null ? totalRevenue  : 0.0,
                totalTrips    != null ? totalTrips    : 0L,
                avgRating     != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                cancellationRate
        );
    }

    /**
     * Generates a monthly revenue breakdown for a specific agent and year.
     * This data is used to populate administrative performance charts.
     */
    public AdminAgentMonthlyRevenueResponse getMonthlyRevenue(Long agentId, int year) {
        agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Standard labels for monthly time-series charts
        List<String> labels = List.of("J","F","M","A","M","J","J","A","S","O","N","D");
        List<Double> data = new ArrayList<>();

        // Iteratively fetch revenue per month from the repository
        for (int month = 1; month <= 12; month++) {
            Double revenue = agentRepository.getMonthlyRevenueByAgentId(agentId, month, year);
            data.add(revenue != null ? revenue : 0.0);
        }

        return new AdminAgentMonthlyRevenueResponse(
                "Monthly",
                labels,
                data
        );
    }

    /**
     * Aggregates the volume of trips categorized by their current status for a specific agent.
     * Suitable for populating operational distribution charts (e.g., Pie charts).
     */
    public AdminAgentTripStatusResponse getTripStatus(Long agentId) {
        agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        Long completed = bookingRepository.countByAgentIdAndStatus(agentId, "completed");
        Long pending = bookingRepository.countByAgentIdAndStatus(agentId, "pending");
        Long cancelled = bookingRepository.countByAgentIdAndStatus(agentId, "cancelled");

        return new AdminAgentTripStatusResponse(
                completed != null ? completed : 0L,
                pending   != null ? pending   : 0L,
                cancelled != null ? cancelled : 0L
        );
    }

    /**
     * Maps an Agent entity to a summary response DTO for administrative lists.
     */
    private AdminAgentListResponse mapToListResponse(Agent a) {
        return new AdminAgentListResponse(
                a.getId(),
                a.getUser().getName(),
                a.getCompanyName(),
                a.getOwnerName(),
                a.getUser().getEmail(),
                a.getUser().getTelephone(),
                a.getLocation(),
                a.getApplicationStatus(),
                a.getSubmittedDate() != null ? a.getSubmittedDate().toString() : null,
                a.getIsActive()
        );
    }
}
