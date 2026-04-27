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

    // ── Company / Agent Info ───────────────────────────
    @Column(nullable = false)
    private String agentName;

    private String companyName;
    private String agencyName;

    private String profileImage;

    // ── Owner Information ──────────────────────────────
    @Column(name = "owner_name")
    private String ownerName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String secondaryPhone;
    private String whatsappNumber;

    private String location;

    // ── Additional Info ────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String bio;

    private String languages;

    // Example: "Colombo,Galle,Kandy"
    private String operatingDistricts;

    private String websiteUrl;

    private LocalDate memberSince;

    // ── NIC ────────────────────────────────────────────
    @Column(name = "nic_image_url")
    private String nicImageUrl;

    // ── Application Status ─────────────────────────────
    @Column(name = "application_status")
    @Builder.Default
    private String applicationStatus = "Pending";

    // ── Submitted Date ─────────────────────────────────
    @Column(name = "submitted_date", updatable = false)
    private LocalDateTime submittedDate;

    // ── Stats ──────────────────────────────────────────
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