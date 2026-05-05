package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.Role;





public class LoginResponse {
    private String token;
    private String name;
    private String email;
    private Role role;
    private String profileImage;
    private Long agentId;
    private Long hotelId;
    private Long id; // User ID

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
