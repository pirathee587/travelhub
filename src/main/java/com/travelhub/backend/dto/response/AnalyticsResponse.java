package com.travelhub.backend.dto.response;

import java.util.List;
import java.util.Map;

public class AnalyticsResponse {
    private Double totalRevenue;
    private Long totalTrips;
    private Double averageRating;
    private Double cancellationRate;
    private List<Map<String, Object>> revenueData;
    private Map<String, Long> tripStatusData;
    private List<Map<String, Object>> topDestinations;
    private List<Map<String, Object>> driverPerformance;
    private List<Map<String, Object>> vehicleUtilization;

    public AnalyticsResponse() {}

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Long getTotalTrips() { return totalTrips; }
    public void setTotalTrips(Long totalTrips) { this.totalTrips = totalTrips; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }
    public List<Map<String, Object>> getRevenueData() { return revenueData; }
    public void setRevenueData(List<Map<String, Object>> revenueData) { this.revenueData = revenueData; }
    public Map<String, Long> getTripStatusData() { return tripStatusData; }
    public void setTripStatusData(Map<String, Long> tripStatusData) { this.tripStatusData = tripStatusData; }
    public List<Map<String, Object>> getTopDestinations() { return topDestinations; }
    public void setTopDestinations(List<Map<String, Object>> topDestinations) { this.topDestinations = topDestinations; }
    public List<Map<String, Object>> getDriverPerformance() { return driverPerformance; }
    public void setDriverPerformance(List<Map<String, Object>> driverPerformance) { this.driverPerformance = driverPerformance; }
    public List<Map<String, Object>> getVehicleUtilization() { return vehicleUtilization; }
    public void setVehicleUtilization(List<Map<String, Object>> vehicleUtilization) { this.vehicleUtilization = vehicleUtilization; }

    public static class Builder {
        private Double totalRevenue;
        private Long totalTrips;
        private Double averageRating;
        private Double cancellationRate;
        private List<Map<String, Object>> revenueData;
        private Map<String, Long> tripStatusData;
        private List<Map<String, Object>> topDestinations;
        private List<Map<String, Object>> driverPerformance;
        private List<Map<String, Object>> vehicleUtilization;

        public Builder totalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; return this; }
        public Builder totalTrips(Long totalTrips) { this.totalTrips = totalTrips; return this; }
        public Builder averageRating(Double averageRating) { this.averageRating = averageRating; return this; }
        public Builder cancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; return this; }
        public Builder revenueData(List<Map<String, Object>> revenueData) { this.revenueData = revenueData; return this; }
        public Builder tripStatusData(Map<String, Long> tripStatusData) { this.tripStatusData = tripStatusData; return this; }
        public Builder topDestinations(List<Map<String, Object>> topDestinations) { this.topDestinations = topDestinations; return this; }
        public Builder driverPerformance(List<Map<String, Object>> driverPerformance) { this.driverPerformance = driverPerformance; return this; }
        public Builder vehicleUtilization(List<Map<String, Object>> vehicleUtilization) { this.vehicleUtilization = vehicleUtilization; return this; }

        public AnalyticsResponse build() {
            AnalyticsResponse r = new AnalyticsResponse();
            r.setTotalRevenue(totalRevenue);
            r.setTotalTrips(totalTrips);
            r.setAverageRating(averageRating);
            r.setCancellationRate(cancellationRate);
            r.setRevenueData(revenueData);
            r.setTripStatusData(tripStatusData);
            r.setTopDestinations(topDestinations);
            r.setDriverPerformance(driverPerformance);
            r.setVehicleUtilization(vehicleUtilization);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}