package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDashboardStatsResponse {
    private Long totalRooms;
    private Long availableRooms;
    private Long totalAmenities;
    private Long totalReviews;
    private Double averageRating;
}
