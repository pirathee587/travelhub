package com.travelhub.backend.entity;

import com.travelhub.backend.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

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
    private String agencyName;            // Agent
    private String licenseNumber;         // Agent (For Admin Verification)
    private String hotelName;             // Hotel Owner
    private String businessRegistrationId; // Hotel Owner (For Admin Verification)
    private String businessAddress;        // Hotel Owner
    private String district;               // Hotel Owner

    // Preferred Language (EN, SI, TA)
    private String preferredLanguage;

    // Auth & Status
    @Column(nullable = true)
    private boolean isEmailVerified = false;

    private String verificationToken;
    private String passwordResetToken;

    @Column(nullable = true)
    private String status = "PENDING"; // PENDING, ACTIVE, DEACTIVATED

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}