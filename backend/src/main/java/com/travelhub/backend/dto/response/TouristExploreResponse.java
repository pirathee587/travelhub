package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Aggregated response for the Tourist Explore page.
 * Combines all packages and personalized recommendations into a single request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TouristExploreResponse {
    private List<PackageResponse> packages;
    private List<PackageResponse> recommendations;
}
