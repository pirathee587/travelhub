package com.travelhub.backend.dto.response;

public class AgentDashboardStatsResponse {
    private Long totalPackages;
    private Long activeTrips;
    private Long completedTrips;
    private Long pendingRequests;
    private Double totalRevenue;
    private Double averageRating;
    private Long totalVehicles;
    private Long totalDrivers;

    public AgentDashboardStatsResponse() {}

    public Long getTotalPackages() { return totalPackages; }
    public void setTotalPackages(Long totalPackages) { this.totalPackages = totalPackages; }
    public Long getActiveTrips() { return activeTrips; }
    public void setActiveTrips(Long activeTrips) { this.activeTrips = activeTrips; }
    public Long getCompletedTrips() { return completedTrips; }
    public void setCompletedTrips(Long completedTrips) { this.completedTrips = completedTrips; }
    public Long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(Long pendingRequests) { this.pendingRequests = pendingRequests; }
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(Long totalVehicles) { this.totalVehicles = totalVehicles; }
    public Long getTotalDrivers() { return totalDrivers; }
    public void setTotalDrivers(Long totalDrivers) { this.totalDrivers = totalDrivers; }

    public static class Builder {
        private Long totalPackages;
        private Long activeTrips;
        private Long completedTrips;
        private Long pendingRequests;
        private Double totalRevenue;
        private Double averageRating;
        private Long totalVehicles;
        private Long totalDrivers;

        public Builder totalPackages(Long totalPackages) { this.totalPackages = totalPackages; return this; }
        public Builder activeTrips(Long activeTrips) { this.activeTrips = activeTrips; return this; }
        public Builder completedTrips(Long completedTrips) { this.completedTrips = completedTrips; return this; }
        public Builder pendingRequests(Long pendingRequests) { this.pendingRequests = pendingRequests; return this; }
        public Builder totalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; return this; }
        public Builder averageRating(Double averageRating) { this.averageRating = averageRating; return this; }
        public Builder totalVehicles(Long totalVehicles) { this.totalVehicles = totalVehicles; return this; }
        public Builder totalDrivers(Long totalDrivers) { this.totalDrivers = totalDrivers; return this; }

        public AgentDashboardStatsResponse build() {
            AgentDashboardStatsResponse r = new AgentDashboardStatsResponse();
            r.setTotalPackages(totalPackages);
            r.setActiveTrips(activeTrips);
            r.setCompletedTrips(completedTrips);
            r.setPendingRequests(pendingRequests);
            r.setTotalRevenue(totalRevenue);
            r.setAverageRating(averageRating);
            r.setTotalVehicles(totalVehicles);
            r.setTotalDrivers(totalDrivers);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}