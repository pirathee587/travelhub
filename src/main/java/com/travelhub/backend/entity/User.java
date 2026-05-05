package com.travelhub.backend.entity;

import com.travelhub.backend.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users", schema = "public")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profileImage;
    private String nationality;
    private String preferredLanguage;

    // Role-specific fields (Hotel Owner)
    private String businessRegistrationId;
    private String businessAddress;
    private String district;

    @Column(name = "is_email_verified")
    private boolean isEmailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;
    private String passwordResetToken;
    private LocalDateTime passwordResetExpires;

    @Column(nullable = true)
    private String status = "PENDING";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "agent_approved")
    private Boolean agentApproved = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // --- Relationships ---
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Agent agentProfile;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Hotel> ownedHotels;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public boolean isEmailVerified() { return isEmailVerified; }
    public void setEmailVerified(boolean emailVerified) { isEmailVerified = emailVerified; }
    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }
    public String getPasswordResetToken() { return passwordResetToken; }
    public void setPasswordResetToken(String passwordResetToken) { this.passwordResetToken = passwordResetToken; }
    public LocalDateTime getPasswordResetExpires() { return passwordResetExpires; }
    public void setPasswordResetExpires(LocalDateTime passwordResetExpires) { this.passwordResetExpires = passwordResetExpires; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Boolean getAgentApproved() { return agentApproved; }
    public void setAgentApproved(Boolean agentApproved) { this.agentApproved = agentApproved; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Agent getAgentProfile() { return agentProfile; }
    public void setAgentProfile(Agent agentProfile) { this.agentProfile = agentProfile; }
    public List<Hotel> getOwnedHotels() { return ownedHotels; }
    public void setOwnedHotels(List<Hotel> ownedHotels) { this.ownedHotels = ownedHotels; }

    public String getBusinessRegistrationId() { return businessRegistrationId; }
    public void setBusinessRegistrationId(String businessRegistrationId) { this.businessRegistrationId = businessRegistrationId; }
    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isActive == null) this.isActive = true;
        if (this.agentApproved == null) this.agentApproved = false;
    }
}