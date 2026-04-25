package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    // Personal Info
    @Column(nullable = false)
    private String firstName;

    private String lastName;

    @Column(nullable = false, unique = true)
    private String nic;

    private String bloodGroup;
    private String nicFrontImage;
    private String nicRearImage;

    // Contact
    private String email;

    @Column(nullable = false)
    private String mobileNumber;

    private String secondaryMobileNumber;
    private String addressLine1;
    private String addressLine2;

    // License
    @Column(nullable = false, unique = true)
    private String licenseNumber;

    private LocalDate licenseExpiryDate;
    private String licenseFrontImage;
    private String licenseRearImage;

    // Vehicle types this driver can drive e.g. "Tuk,Car,Minivan"
    private String vehicleTypes;

    // Status
    @Column(nullable = false)
    private String status = "available"; // available | on-trip | off-duty

    @Column(nullable = false)
    private String lifecycleStatus = "active"; // active | suspended

    // Stats
    private Double rating;
    private String profileImage;

    // Currently assigned vehicle (just store the name for display)
    private String assignedVehicle;
}