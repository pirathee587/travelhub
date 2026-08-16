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
        String  nicVerificationStatus,
        String  submittedDate,
        boolean isActive,
        String  profileImage,
        Double  rating,
        Integer totalTrips,
        String  nicNumber,
        Integer experienceYears
) {}
