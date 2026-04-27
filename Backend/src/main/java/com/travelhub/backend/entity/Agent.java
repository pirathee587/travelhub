package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String companyName;
    private Double rating;
    private Integer totalTrips;
    private Integer experienceYears;
    private String languages;
    private String profileImage;

    @Column(nullable = false)
    private Boolean isActive = true;
}