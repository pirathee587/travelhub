package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Aggregated response for the Tourist Hotel Details page.
 * Combines hotel info, image gallery, room list, reviews, and average rating into a single request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TouristHotelDetailsResponse {
    private HotelResponse hotel;
    private List<String> images;
    private List<RoomResponse> rooms;
    private List<ReviewResponse> reviews;
    private ReviewSummaryResponse ratingInfo;
}
