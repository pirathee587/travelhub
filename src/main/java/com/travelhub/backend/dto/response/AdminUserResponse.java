package com.travelhub.backend.dto.response;

public record AdminUserResponse(
        Long    id,
        String  name,
        String  email,
        String  role,
        String  telephone,
        Boolean isActive,
        Boolean agentApproved,
        String  createdAt
) {}