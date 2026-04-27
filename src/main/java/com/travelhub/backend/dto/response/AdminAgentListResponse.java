package com.travelhub.backend.dto.response;

public record AdminAgentListResponse(
        Long id,
        String agentName,
        String companyName,
        String ownerName,
        String email,
        String phone,
        String location,
        String applicationStatus,
        String submittedDate,

        // Stats (from old DTO)
        Double rating,
        Integer totalTrips,
        Integer experienceYears,

        Boolean isActive
) {}