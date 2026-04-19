package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class AgentProfileRequest {
    private String agentName;
    private String phone;
    private String secondaryPhone;
    private String whatsappNumber;
    private String location;
    private String bio;
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    private String profileImage;
    private String companyName;
}