package com.travelhub.backend.dto.response;

public record AdminAgentPackageResponse(
        Long   id,
        String packageName,


        String duration,
        String category,
        Double rating,

        Boolean isActive,
        String applicationStatus
) {}