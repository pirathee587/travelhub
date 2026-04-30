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

    // --- Admin Control Fields ---
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "agent_approved")
    @Builder.Default
    private Boolean agentApproved = false;

    // --- Password Reset Logic ---
    private String passwordResetToken;
    private LocalDateTime passwordResetExpires;

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