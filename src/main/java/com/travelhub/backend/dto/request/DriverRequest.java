package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class DriverRequest {
    private String firstName;
    private String lastName;
    private String nic;
    private String bloodGroup;
    private String nicFrontImage;
    private String nicRearImage;
    private String email;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String addressLine1;
    private String addressLine2;
    private String licenseNumber;
    private String licenseExpiryDate;
    private String licenseFrontImage;
    private String licenseRearImage;
    private String vehicleTypes;
    private String profileImage;
}