package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Public user profile response DTO.
 * Used by /api/tourist/profile endpoint (no JWT required).
 * When JWT auth is implemented later, replace this with data from the JWT-authenticated user.
 */
@Data
@Builder
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String telephone;
    private String profileImage;
    private String nationality;
    private String preferredLanguage;
    private String role;
}
