package com.travelhub.backend.dto.response;

public class HotelDashboardStatsResponse {
    private Long totalRooms;
    private Long availableRooms;
    private Long totalAmenities;
    private Long totalReviews;
    private Double averageRating;

    public HotelDashboardStatsResponse() {}

    public Long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Long totalRooms) { this.totalRooms = totalRooms; }
    public Long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Long availableRooms) { this.availableRooms = availableRooms; }
    public Long getTotalAmenities() { return totalAmenities; }
    public void setTotalAmenities(Long totalAmenities) { this.totalAmenities = totalAmenities; }
    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public static class Builder {
        private Long totalRooms;
        private Long availableRooms;
        private Long totalAmenities;
        private Long totalReviews;
        private Double averageRating;

        public Builder totalRooms(Long totalRooms) { this.totalRooms = totalRooms; return this; }
        public Builder availableRooms(Long availableRooms) { this.availableRooms = availableRooms; return this; }
        public Builder totalAmenities(Long totalAmenities) { this.totalAmenities = totalAmenities; return this; }
        public Builder totalReviews(Long totalReviews) { this.totalReviews = totalReviews; return this; }
        public Builder averageRating(Double averageRating) { this.averageRating = averageRating; return this; }
        public HotelDashboardStatsResponse build() {
            HotelDashboardStatsResponse res = new HotelDashboardStatsResponse();
            res.setTotalRooms(totalRooms);
            res.setAvailableRooms(availableRooms);
            res.setTotalAmenities(totalAmenities);
            res.setTotalReviews(totalReviews);
            res.setAverageRating(averageRating);
            return res;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
