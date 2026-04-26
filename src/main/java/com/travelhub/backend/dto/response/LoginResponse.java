package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String name;
    private String email;
    private Role role;
    private String profileImage;
    private Long agentId;
    private Long hotelId;
    private Long id; // User ID
}
