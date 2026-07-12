package com.travelhub.backend.dto.response;

public record AdminAgentListResponse(
        Long    id,
        Long    ownerId,
        String  agentName,
        String  companyName,
        String  ownerName,
        String  email,
        String  phone,
        String  location,
        String  applicationStatus,
        String  submittedDate,
        boolean isActive
) {}