package com.travelhub.backend.dto.response;

public record AdminPackageResponse(
        Long    id,
        String  packageName,
        String  destination,
        Double  priceFrom,
        Double  priceTo,
        String  duration,
        String  category,
        Double  rating,
        Integer reviewCount,
        boolean trending,
        boolean isActive,
        String  agentName,
        String  applicationStatus,
        String  imageUrl
) {}