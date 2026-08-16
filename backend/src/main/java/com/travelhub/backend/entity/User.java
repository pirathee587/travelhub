package com.travelhub.backend.entity;

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

    @Column(nullable = false)
    private String password;

    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String profileImage;

    // Role-specific fields (Nullable based on role)
    private String nationality;           // Tourist
<<<<<<< Updated upstream
    private String nicNumber;             // Agent (Captured at Signup)
    private String nicImage;              // Agent (Captured in Profile)

    // ── NIC Verification ──────────────────────────────
    // Values: PENDING | APPROVED | REJECTED | SUSPENDED
    @Column(name = "nic_verification_status", length = 20)
    @Builder.Default
    private String nicVerificationStatus = "PENDING";

    @Column(name = "admin_message", columnDefinition = "TEXT")
    private String adminMessage;
=======
    private String nicNumber;             // Agent + Hotel Owner (Captured at Signup)
    private String nicImage;              // Agent + Hotel Owner (Captured in Profile / Hotel Setup)
>>>>>>> Stashed changes
    private String hotelName;             // Hotel Owner
    private String businessRegistrationId; // Hotel Owner (For Admin Verification)
    private String businessAddress;        // Hotel Owner
    private String district;               // Hotel Owner

    // Preferred Language (EN, SI, TA)
    private String preferredLanguage;

    // Currency preference for Tourists (USD or LKR), default USD
    @Column(name = "currency_preference", length = 10)
    @Builder.Default
    private String currencyPreference = "USD";

    // Auth & Status
    @Column(name = "is_email_verified", nullable = true)
    @Builder.Default
    private boolean isEmailVerified = false;

    private String verificationToken;
    private String passwordResetToken;
    private LocalDateTime passwordResetExpires;

    @Column(nullable = true)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACTIVE, DEACTIVATED

    // --- Admin Control Fields ---
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "agent_approved")
    @Builder.Default
    private Boolean agentApproved = false;

    private Long agentId; // Legacy Link to the Agent table (To be removed after Agent refactor)
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Agent> agencies;
    
    private Long hotelId; // Link to the Hotel table
    
    @Column(name = "outstanding_fine_balance")
    @Builder.Default
    private Double outstandingFineBalance = 0.0;

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
        if (this.nicVerificationStatus == null) this.nicVerificationStatus = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}