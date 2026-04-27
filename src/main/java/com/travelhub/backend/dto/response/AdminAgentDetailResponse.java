package com.travelhub.backend.dto.response;

public record AdminAgentDetailResponse(

        Long   id,

        // ── Header ─────────────────────────────────────
        // Company logo initials — "PT"
        String initials,


        String agentName,


        String companyName,

        String profileImage,

        // ── Owner Information ──────────────────────────

        String ownerName,


        String email,


        String phone,


        String location,


        String memberSince,

        // ── Application Status ─────────────────────────
        // Pending, Approved, Rejected
        String applicationStatus,


        String submittedDate,

        // ── NIC ────────────────────────────────────────
        // View NIC button-க்கு
        String nicImageUrl,

        // ── Extra ──────────────────────────────────────
        Double  rating,
        Integer totalTrips,
        Integer experienceYears,
        Boolean isActive
) {}