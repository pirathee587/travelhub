package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleOwnerResponse {
    private Long id;
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
