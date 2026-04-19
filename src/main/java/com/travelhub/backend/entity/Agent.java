package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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

    @Column(nullable = false)
    private String agentName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String secondaryPhone;
    private String whatsappNumber;
    private String companyName;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String languages;

    // Store as comma-separated string e.g. "Colombo,Galle,Kandy"
    private String operatingDistricts;

    private String websiteUrl;
    private String profileImage;
    private LocalDate memberSince;

    private Double rating;
    private Integer totalTrips;
    private Integer totalRevenue;
    private Integer experienceYears;
    private Double completionRate;

    @Column(nullable = false)
    private Boolean isActive = true;
}