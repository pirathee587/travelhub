package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Aggregated response for the Tourist Overview Dashboard page.
 * Combines stats, trips, documents, and recommendations into a single request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TouristOverviewResponse {
    private StatsResponse stats;
    private List<TripResponse> trips;
    private List<DocumentResponse> documents;
    private List<PackageResponse> recommendations;
}
