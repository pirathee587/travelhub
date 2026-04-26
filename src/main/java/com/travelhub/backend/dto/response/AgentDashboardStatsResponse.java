package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgentDashboardStatsResponse {
    private Long totalPackages;
    private Long activeTrips;
    private Long completedTrips;
    private Long pendingRequests;
    private Double totalRevenue;
    private Double averageRating;
    private Long totalVehicles;
    private Long totalDrivers;
}