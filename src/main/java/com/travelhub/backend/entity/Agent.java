package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    // ── Company / Agent Info ───────────────────────────
    private User owner;                    // Owner mapping referencing User

    @Column(name = "agency_name", nullable = false)
    private String agencyName;             // Brand/Business name of agency

    // ── Contact Information ──────────────────────────────
    // --- Contact Details ---
    private String agencyNumber;
    private String secondaryNumber;
    private String whatsappNumber;

    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    
    private LocalDate memberSince;

    // ── Submitted Date ─────────────────────────────────
    @Column(name = "submitted_date", updatable = false)
    private LocalDateTime submittedDate;

    // --- Performance Metrics ---
    private Double rating;
    private Integer totalTrips;
    private Integer totalRevenue;
    private Integer experienceYears;
    private Double completionRate;

    // ── Status ─────────────────────────────────────────
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ── Auto Timestamp ─────────────────────────────────
    @PrePersist
    protected void onCreate() {
        if (submittedDate == null) {
            submittedDate = LocalDateTime.now();
        }
    }
}
