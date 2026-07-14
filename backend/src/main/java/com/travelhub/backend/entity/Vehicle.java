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
    @JoinColumn(name = "agent_id", nullable = true)
    private Agent agent;

    // Owner Information
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = true)
    private VehicleOwner owner;

    // Vehicle Details
    @Column(nullable = true)
    private String vehicleType;   // Tuk | Car | Minivan/VAN

    @Column(nullable = true)
    private String brand;

    @Column(nullable = true)
    private String model;

    private String color;
    private String capacity;
    private String yearOfManufacture;

    @Column(nullable = true, unique = true)
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
    @Column(nullable = true)
    private String status = "available";       // available | booked | maintenance

    @Column(nullable = true)
    private String lifecycleStatus = "active"; // active | suspended

    // Currently assigned driver name (for display)
    private String assignedDriverName;

    // Kept for teammate's BookingService compatibility
    private String driverName;
    private String driverPhone;
    private Double driverRating;
    private Integer driverTrips;

    @Column(nullable = false)
    private Boolean isAvailable = true;
}