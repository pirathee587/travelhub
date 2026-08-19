package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.*;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAgentAnalyticsService {

    private final AgentRepository   agentRepository;
    private final BookingRepository bookingRepository;

    // ── Get All Agents List ───────────────────────────
    // Admin portal-ல் analytics & reports-க்கு approved/active agents பட்டியல் மட்டுமே (Pending & Rejected excluded)
    public List<AdminAgentListResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .filter(a -> {
                    String status = resolveAgentStatus(a.getOwner(), a);
                    return !"Pending".equalsIgnoreCase(status) && !"Rejected".equalsIgnoreCase(status);
                })
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Resolve Agent Status ──────────────────────────
    private String resolveAgentStatus(com.travelhub.backend.entity.User owner, Agent agent) {
        if (owner == null) return "Pending";
        if (Boolean.FALSE.equals(owner.getIsActive()) || (agent != null && Boolean.FALSE.equals(agent.getIsActive())) || "SUSPENDED".equalsIgnoreCase(owner.getNicVerificationStatus())) {
            return "Suspended";
        }
        if ("REJECTED".equalsIgnoreCase(owner.getNicVerificationStatus())) {
            return "Rejected";
        }
        if (Boolean.TRUE.equals(owner.getAgentApproved()) || "APPROVED".equalsIgnoreCase(owner.getNicVerificationStatus())) {
            return "Approved";
        }
        return "Pending";
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
                "Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec");

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
    // Pie chart — Completed, Active, Pending, Cancelled
    public AdminAgentTripStatusResponse
    getTripStatus(Long agentId) {

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", agentId));

        Long completed = bookingRepository
                .countByAgentIdAndStatus(
                        agentId, "completed");
        Long active = bookingRepository
                .countByAgentIdAndStatusIn(
                        agentId, List.of("confirmed", "in_progress", "active", "paid"));
        Long pending = bookingRepository
                .countByAgentIdAndStatus(
                        agentId, "pending");
        Long cancelled = bookingRepository
                .countByAgentIdAndStatusIn(
                        agentId, List.of("cancelled", "rejected", "refund_requested"));

        return new AdminAgentTripStatusResponse(
                completed != null ? completed : 0L,
                active    != null ? active    : 0L,
                pending   != null ? pending   : 0L,
                cancelled != null ? cancelled : 0L
        );
    }

    // ── Resolve NIC Status ────────────────────────────
    private String resolveNicStatus(com.travelhub.backend.entity.User owner) {
        if (owner == null) return "PENDING";
        boolean hasNicDoc = owner.getNicImage() != null && !owner.getNicImage().isBlank();
        boolean hasNicNumber = owner.getNicNumber() != null && !owner.getNicNumber().isBlank() && !"—".equals(owner.getNicNumber().trim());
        String status = owner.getNicVerificationStatus();

        if ("SUSPENDED".equalsIgnoreCase(status)) return "SUSPENDED";
        if ("REJECTED".equalsIgnoreCase(status)) return "REJECTED";

        // ONLY verified if an actual NIC document image is uploaded AND approved
        if (hasNicDoc && ("APPROVED".equalsIgnoreCase(status) || Boolean.TRUE.equals(owner.getAgentApproved()))) {
            return "APPROVED";
        }
        if (hasNicDoc || hasNicNumber) {
            return "PROVIDED";
        }
        return "PENDING";
    }

    // ── Map Agent → List Response ─────────────────────
    private AdminAgentListResponse mapToListResponse(
            Agent a) {
        // Use cached totalTrips from agent entity to avoid N+1 query
        Integer totalTripsVal = a.getTotalTrips() != null ? a.getTotalTrips() : 0;
        Double totalRevenueVal = agentRepository.getTotalRevenueByAgentId(a.getId());
        Long compCount = bookingRepository.countByAgentIdAndStatus(a.getId(), "completed");

        return new AdminAgentListResponse(
                a.getId(),
                a.getOwner() != null ? a.getOwner().getId() : null,
                a.getAgencyName(),
                a.getAgencyName(),
                a.getOwner() != null ? a.getOwner().getName() : null,
                a.getOwner() != null ? a.getOwner().getEmail() : null,
                a.getOwner() != null ? a.getOwner().getTelephone() : null,
                a.getLocation(),
                a.getOwner() != null ? a.getOwner().getProfileImage() : null,
                a.getBio(),
                a.getRating() != null ? a.getRating() : 0.0,
                totalTripsVal,
                0,
                a.getExperienceYears() != null ? a.getExperienceYears() : 0,
                a.getOwner() != null ? a.getOwner().getNicNumber() : null,
                resolveAgentStatus(a.getOwner(), a),
                resolveNicStatus(a.getOwner()),
                a.getSubmittedDate() != null ? a.getSubmittedDate().toString() : null,
                a.getIsActive() != null ? a.getIsActive() : true,
                totalRevenueVal != null ? totalRevenueVal : 0.0,
                compCount != null ? compCount.intValue() : 0
        );
    }
}

