package com.travelhub.backend.dto.response;

public record AdminAgentTripStatusResponse(
        Long completed,
        Long pending,
        Long cancelled
) {}