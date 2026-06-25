package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.District;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OwnerProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String telephone;
    private String profileImage;
    private String preferredLanguage;
    private String businessAddress;
    private District district;
    private String businessRegistrationId;
    private String status;
    private LocalDateTime updatedAt;
}
