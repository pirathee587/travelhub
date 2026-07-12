package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentDetailResponse {
    private Long id;
    private String agencyName;
    private String agentName;
    private String profileImage;
    private String bio;
    private String location;
    private String email;
    private String phone;
    private String whatsappNumber;
    private String companyName;
    private String languages;
    private String operatingDistricts;
    private String websiteUrl;
    private Double rating;
    private Integer totalTrips;
    private String memberSince;
    private List<PackageResponse> packages;
}
