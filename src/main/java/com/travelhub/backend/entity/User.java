package com.travelhub.backend.entity;

import com.travelhub.backend.enums.Role;
import com.travelhub.backend.enums.District;
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

    @Column(nullable = false)
    private String password;

    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profileImage;

    // Role-specific fields (Nullable based on role)
    private String nationality;           // Tourist
    private String nicNumber;             // Agent (Captured at Signup)
    private String nicImage;              // Agent (Captured in Profile)
    private String hotelName;             // Hotel Owner
    private String businessRegistrationId; // Hotel Owner (For Admin Verification)
    private String businessAddress;        // Hotel Owner
    private District district;               // Hotel Owner

    // Preferred Language (EN, SI, TA)
    private String preferredLanguage;

    // Auth & Status
    @Column(name = "is_email_verified", nullable = true)
    private boolean isEmailVerified = false;

    private String verificationToken;
    private String passwordResetToken;
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

    private Long agentId; // Legacy Link to the Agent table (To be removed after Agent refactor)
    
    private Long hotelId; // Link to the Hotel table
    

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) this.isActive = true;
        if (this.agentApproved == null) this.agentApproved = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}