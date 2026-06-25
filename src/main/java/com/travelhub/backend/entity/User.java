package com.travelhub.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.travelhub.backend.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profileImage;

    // Role-specific fields (Nullable based on role)
    private String nationality;           // Tourist
    private String agencyName;            // Agent
    private String hotelName;             // Hotel Owner
    private String businessRegistrationId; // Hotel Owner (For Admin Verification)
    private String businessAddress;        // Hotel Owner
    private String district;               // Hotel Owner

    // Preferred Language (EN, SI, TA)
    private String preferredLanguage;

    // Auth & Status
    @Column(name = "is_email_verified", nullable = true)
    private boolean isEmailVerified = false;

    @JsonIgnore
    private String verificationToken;
    @JsonIgnore
    private String passwordResetToken;
    @JsonIgnore
    private LocalDateTime passwordResetExpires;

    @Column(nullable = true)
    private String status = "PENDING"; // PENDING, ACTIVE, DEACTIVATED

    // --- Admin Control Fields ---
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "agent_approved")
    @Builder.Default
    private Boolean agentApproved = false;

    private Long hotelId; // Link to the Hotel table

    // --- Refactored Agent Verification Fields ---
    private String nicNumber;             // Captured at Signup
    private String nicImage;              // Captured in Profile

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Agent> agencies;          // Owned agencies list
    

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Fallback checks for non-builder instantiation
        if (this.isActive == null) this.isActive = true;
        if (this.agentApproved == null) this.agentApproved = false;
    }
}