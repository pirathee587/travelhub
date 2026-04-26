package com.travelhub.backend.dto.response;

public record AdminAgentListResponse(
        Long   id,
        String agentName,
        String companyName,
        String email,
        String phone,
        Double rating,
        Integer totalTrips,
        Integer experienceYears,
        Boolean isActive
) {}