package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalyticsResponse {

    // Stat cards
    private Double totalRevenue;
    private Long totalTrips;
    private Double averageRating;
    private Double cancellationRate;

    // Revenue chart data — list of { label, value }
    private List<Map<String, Object>> revenueData;

    // Trip status pie chart — { completed, active, pending, cancelled }
    private Map<String, Long> tripStatusData;

    // Top destinations — list of { destination, count }
    private List<Map<String, Object>> topDestinations;

    // Driver performance — list of { name, trips, rating }
    private List<Map<String, Object>> driverPerformance;

    // Vehicle utilization — list of { name, trips }
    private List<Map<String, Object>> vehicleUtilization;
}