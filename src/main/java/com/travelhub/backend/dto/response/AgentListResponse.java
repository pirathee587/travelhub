package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentListResponse {
    private Long id;
    private String agencyName;
    private String agentName;
    private String profileImage;
    private String bio;
    private String location;
    private Double rating;
    private Integer totalTrips;
    private String memberSince;
}
