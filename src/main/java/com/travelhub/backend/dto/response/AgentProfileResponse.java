package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgentProfileResponse {
    private Long id;
    private String agentName;
    private String email;
    private String phone;
    private String secondaryPhone;
    private String whatsappNumber;
    private String companyName;
    private String location;
    private String bio;
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    private String profileImage;
    private String memberSince;
    private Double rating;
    private Integer totalTrips;
    private Integer totalRevenue;
    private Double completionRate;
}