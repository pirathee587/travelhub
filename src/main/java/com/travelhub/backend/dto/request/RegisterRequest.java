package com.travelhub.backend.dto.request;

import com.travelhub.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;





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
    private String licenseNumber;
    private String hotelName;
    private String businessRegistrationId;
    private String businessAddress;
    private String district;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public String getBusinessRegistrationId() { return businessRegistrationId; }
    public void setBusinessRegistrationId(String businessRegistrationId) { this.businessRegistrationId = businessRegistrationId; }
    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
}
