package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class VehicleRequest {
    private Long ownerId;
    private String ownerFirstName;
    private String ownerLastName;
    private String nicNumber;
    private String nicFrontImage;
    private String nicRearImage;
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
    private String insuranceCardFront;
    private String insuranceExpiryDate;
    private String revenueLicenseImage;
    private String vehicleImageFront;
    private String vehicleImageBack;
    private String vehicleImageSide;
    private String vehicleImageInside;
}