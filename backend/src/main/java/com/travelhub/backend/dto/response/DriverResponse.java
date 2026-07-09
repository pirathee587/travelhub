package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriverResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String nic;
    private String bloodGroup;
    private String email;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String addressLine1;
    private String addressLine2;
    private String licenseNumber;
    private String licenseExpiryDate;
    private String vehicleTypes;
    private String status;
    private String lifecycleStatus;
    private Double rating;
    private String profileImage;
    private String assignedVehicle;
}