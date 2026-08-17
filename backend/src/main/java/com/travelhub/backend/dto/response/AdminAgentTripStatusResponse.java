package com.travelhub.backend.dto.response;

public record AdminAgentTripStatusResponse(
        Long completed,
        Long active,
        Long pending,
        Long cancelled
) {}