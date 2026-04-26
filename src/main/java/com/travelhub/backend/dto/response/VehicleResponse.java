package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleResponse {
    private Long id;
    private String ownerFirstName;
    private String ownerLastName;
    private String nicNumber;
    private String addressLine1;
    private String addressLine2;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String ownerEmail;
    private String vehicleType;
    private String brand;
    private String model;
    private String color;
    private String capacity;
    private String yearOfManufacture;
    private String registration;
    private String insuranceExpiryDate;
    private String vehicleImageFront;
    private String vehicleImageBack;
    private String vehicleImageSide;
    private String vehicleImageInside;
    private String status;
    private String lifecycleStatus;
    private String assignedDriverName;
}