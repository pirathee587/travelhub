package com.travelhub.backend.dto.request;

import com.travelhub.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Telephone is required")
    private String telephone;

    @NotNull(message = "Role is required")
    private Role role;

    @NotBlank(message = "Preferred language is required")
    private String preferredLanguage;

    // Role-specific optional fields
    private String nationality;
    private String agencyName;
    private String nicNumber;
    private String hotelName;
    private String businessRegistrationId;
    private String businessAddress;
    private String district;
}
