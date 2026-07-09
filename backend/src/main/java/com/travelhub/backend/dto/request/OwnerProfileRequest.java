package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class OwnerProfileRequest {
    private String name;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String businessAddress;
    private String district;
}
