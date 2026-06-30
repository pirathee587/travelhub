package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_owners")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = true)
    private Agent agent;

    private String firstName;
    private String lastName;

    @Column(nullable = false, unique = true)
    private String nicNumber;

    private String nicFrontImage;
    private String nicRearImage;
    private String addressLine1;
    private String addressLine2;

    @Column(nullable = false)
    private String mobileNumber;

    private String secondaryMobileNumber;
    private String email;
}
