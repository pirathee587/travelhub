package com.travelhub.backend.dto.response;

public record AdminPackageResponse(
        Long    id,
        String  packageName,


        String  duration,
        String  category,
        Double  rating,
        Integer reviewCount,

        boolean isActive,
        String  agentName,
        String  applicationStatus
) {}