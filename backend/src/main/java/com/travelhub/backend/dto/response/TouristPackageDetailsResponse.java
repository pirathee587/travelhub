package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Aggregated response for the Tourist Package Details page.
 * Combines package details, reviews, and average rating into a single request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TouristPackageDetailsResponse {
    private PackageDetailResponse packageDetails;
    private List<ReviewResponse> reviews;
    private ReviewSummaryResponse ratingInfo;
}
