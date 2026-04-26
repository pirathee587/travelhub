package com.travelhub.backend.dto.response;

public record AdminAgentStatsResponse(

        // Header info
        Long   agentId,
        String agentName,
        String companyName,
        Double agentRating,

        // ── 4 Stats Cards ──────────────────────────────

        // Card 1 — Total Revenue
        Double totalRevenue,

        // Card 2 — Total Trips
        Long totalTrips,

        // Card 3 — Average Rating
        Double averageRating,

        // Card 4 — Cancellation Rate (%)
        Double cancellationRate
) {}
