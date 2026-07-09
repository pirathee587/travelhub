package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class VehicleOwnerRequest {
    private String firstName;
    private String lastName;
    private String nicNumber;
    private String nicFrontImage;
    private String nicRearImage;
    private String addressLine1;
    private String addressLine2;
    private String mobileNumber;
    private String secondaryMobileNumber;
    private String email;
}
