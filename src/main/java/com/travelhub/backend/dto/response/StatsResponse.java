package com.travelhub.backend.dto.response;

public class StatsResponse {
    private Long totalTrips;
    private Long ongoingTrips;
    private Long completedTrips;
    private Long upcomingTrips;

    public StatsResponse() {}

    public Long getTotalTrips() { return totalTrips; }
    public void setTotalTrips(Long totalTrips) { this.totalTrips = totalTrips; }
    public Long getOngoingTrips() { return ongoingTrips; }
    public void setOngoingTrips(Long ongoingTrips) { this.ongoingTrips = ongoingTrips; }
    public Long getCompletedTrips() { return completedTrips; }
    public void setCompletedTrips(Long completedTrips) { this.completedTrips = completedTrips; }
    public Long getUpcomingTrips() { return upcomingTrips; }
    public void setUpcomingTrips(Long upcomingTrips) { this.upcomingTrips = upcomingTrips; }

    public static class Builder {
        private Long totalTrips;
        private Long ongoingTrips;
        private Long completedTrips;
        private Long upcomingTrips;

        public Builder totalTrips(Long totalTrips) { this.totalTrips = totalTrips; return this; }
        public Builder ongoingTrips(Long ongoingTrips) { this.ongoingTrips = ongoingTrips; return this; }
        public Builder completedTrips(Long completedTrips) { this.completedTrips = completedTrips; return this; }
        public Builder upcomingTrips(Long upcomingTrips) { this.upcomingTrips = upcomingTrips; return this; }

        public StatsResponse build() {
            StatsResponse r = new StatsResponse();
            r.setTotalTrips(totalTrips);
            r.setOngoingTrips(ongoingTrips);
            r.setCompletedTrips(completedTrips);
            r.setUpcomingTrips(upcomingTrips);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}