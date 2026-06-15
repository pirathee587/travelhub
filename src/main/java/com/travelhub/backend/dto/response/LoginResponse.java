package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.Role;

/**
 * LoginResponse is a Data Transfer Object (DTO) returned upon successful authentication.
 * It provides the JWT access token and essential user metadata required by the frontend 
 * to establish the session and customize the UI.
 */
public class LoginResponse {
    
    // The cryptographically signed access token for subsequent API requests
    private String token;

    // The display name of the authenticated user
    private String name;

    // The primary email identifier
    private String email;

    // The system role, used for frontend route guarding and navigation
    private Role role;

    // Optional: URL to the user's avatar
    private String profileImage;

    // Business-specific identifiers (nullable if not applicable to the role)
    private Long agentId;
    private Long hotelId;

    // The unique internal database identifier for the User entity
    private Long id; 

    // --- Standard Getters and Setters ---

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
