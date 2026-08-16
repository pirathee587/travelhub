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
        String  profileImage,
        String  bio,
        Double  rating,
        Integer totalTrips,
        Integer totalPackages,
        Integer experienceYears,
        String  ownerNic,
        String  applicationStatus,
        String  nicVerificationStatus,
        String  submittedDate,
        boolean isActive
) {}
