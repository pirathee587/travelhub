package com.travelhub.backend.dto.response;

public record AdminAgentPackageResponse(
        Long   id,
        String packageName,
        String destination,
        Double priceFrom,
        Double priceTo,
        String duration,
        String category,
        Double rating,
        Boolean trending,
        Boolean isActive,
        String applicationStatus
) {}