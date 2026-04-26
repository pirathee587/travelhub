package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String nationality;
}
