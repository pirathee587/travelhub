package com.travelhub.backend.dto.response;


public record AdminUserResponse(
        Long id,
        String name,
        String email,
        String role,
        String telephone,
        Boolean isActive,a
        Boolean agentApproved,
        String createdAt
) {}