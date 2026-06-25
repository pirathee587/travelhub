package com.travelhub.backend.dto.request;

import lombok.Data;
import com.travelhub.backend.enums.District;

@Data
public class OwnerProfileRequest {
    private String name;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String businessAddress;
    private District district;
}
