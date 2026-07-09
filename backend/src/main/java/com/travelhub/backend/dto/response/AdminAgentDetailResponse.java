package com.travelhub.backend.dto.response;

public record AdminAgentDetailResponse(
        Long    id,
        String  initials,
        String  agentName,
        String  companyName,
        String  profileImage,
        String  ownerName,
        String  email,
        String  phone,
        String  location,
        String  memberSince,
        String  applicationStatus,
        String  submittedDate,
        String  ownerNic,
        String  nicImageUrl,
        Double  rating,
        Integer totalTrips,
        Integer experienceYears,
        boolean isActive
) {}