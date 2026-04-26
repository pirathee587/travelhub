package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    // Owner Information
    @Column(nullable = false)
    private String ownerFirstName;

    private String ownerLastName;

    @Column(nullable = false, unique = true)
    private String nicNumber;

    private String nicFrontImage;
    private String nicRearImage;
    private String addressLine1;
    private String addressLine2;

    @Column(nullable = false)
    private String mobileNumber;

    private String secondaryMobileNumber;
    private String ownerEmail;

    // Vehicle Details
    @Column(nullable = false)
    private String vehicleType;   // Tuk | Car | Minivan/VAN

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    private String color;
    private Integer capacity;
    private String yearOfManufacture;

    @Column(nullable = false, unique = true)
    private String registration;

    // Documents
    private String insuranceCardFront;
    private String insuranceExpiryDate;
    private String revenueLicenseImage;
    private String vehicleImageFront;
    private String vehicleImageBack;
    private String vehicleImageSide;
    private String vehicleImageInside;

    // Status
    @Column(nullable = false)
    private String status = "available";       // available | booked | maintenance

    @Column(nullable = false)
    private String lifecycleStatus = "active"; // active | suspended

    // Currently assigned driver name (for display)
    private String assignedDriverName;

    // Keep these from original so nothing breaks for teammates
    private String driverName;
    private String driverPhone;
    private Double driverRating;
    private Integer driverTrips;

    @Column(nullable = false)
    private Boolean isAvailable = true;
}