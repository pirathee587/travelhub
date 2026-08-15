package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Aggregated response for the Tourist Overview (Dashboard) page.
 *
 * Combines stats, trips, documents and recommendations into a single payload
 * so the frontend can load the entire Overview page with ONE HTTP request
 * instead of four separate calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TouristOverviewResponse {

    /** Trip statistics (total, ongoing, completed, upcoming). */
    private StatsResponse stats;

    /** All bookings/trips for the user. */
    private List<TripResponse> trips;

    /** All documents (invoices, receipts, uploads) for the user. */
    private List<DocumentResponse> documents;

    /** Personalised package recommendations. */
    private List<PackageResponse> recommendations;
}
