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

    @Column(nullable = false)
    private String driverName;

    private String driverPhone;
    private Double driverRating;
    private Integer driverTrips;

    @Column(nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private String vehicleModel;

    @Column(nullable = false)
    private String registration;

    private String capacity;

    @Column(nullable = false)
    private Boolean isAvailable = true;
}
