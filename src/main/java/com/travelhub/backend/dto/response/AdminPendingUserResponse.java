package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.Role;

/**
 * AdminPendingUserResponse is a DTO used for displaying pending Agent and Hotel Owner applications
 * in the administrative dashboard.
 */
public record AdminPendingUserResponse(
    Long id,
    String name,
    String email,
    String phone,
    Role role,
    String licenseNumber,
    String hotelName
) {}
