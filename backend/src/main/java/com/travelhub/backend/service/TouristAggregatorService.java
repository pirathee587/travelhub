package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.dto.response.StatsResponse;
import com.travelhub.backend.dto.response.TouristOverviewResponse;
import com.travelhub.backend.dto.response.TripResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * API Aggregator Service for the Tourist Overview (Dashboard) page.
 *
 * Replaces four independent frontend API calls:
 *   GET /api/tourist/stats
 *   GET /api/tourist/trips
 *   GET /api/tourist/documents
 *   GET /api/tourist/recommendations
 *
 * with a single aggregated endpoint:
 *   GET /api/tourist/overview
 *
 * All four sub-calls execute in parallel using CompletableFuture to minimise
 * total response latency. Each sub-call is independently fault-tolerant:
 * if one fails, the others still return their data.
 *
 * Architecture:
 *   Frontend → GET /api/tourist/overview
 *                → TouristAggregatorService
 *                     ├── DashboardService.getStats()
 *                     ├── BookingService.getTripsByUserId()
 *                     ├── DocumentService.getDocumentsByUserId()
 *                     └── RecommendationService.getRecommendations()
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TouristAggregatorService {

    private final DashboardService dashboardService;
    private final BookingService bookingService;
    private final DocumentService documentService;
    private final RecommendationService recommendationService;

    /**
     * Fetches all data required for the Overview page in parallel.
     *
     * @param userId the ID of the currently active tourist
     * @return aggregated overview response
     */
    public TouristOverviewResponse getOverview(Long userId) {
        // Launch all four sub-calls in parallel
        CompletableFuture<StatsResponse> statsFuture =
                CompletableFuture.supplyAsync(() -> fetchStats(userId));

        CompletableFuture<List<TripResponse>> tripsFuture =
                CompletableFuture.supplyAsync(() -> fetchTrips(userId));

        CompletableFuture<List<DocumentResponse>> documentsFuture =
                CompletableFuture.supplyAsync(() -> fetchDocuments(userId));

        CompletableFuture<List<PackageResponse>> recommendationsFuture =
                CompletableFuture.supplyAsync(() -> fetchRecommendations(userId));

        // Wait for all to complete
        CompletableFuture.allOf(statsFuture, tripsFuture, documentsFuture, recommendationsFuture).join();

        return TouristOverviewResponse.builder()
                .stats(statsFuture.join())
                .trips(tripsFuture.join())
                .documents(documentsFuture.join())
                .recommendations(recommendationsFuture.join())
                .build();
    }

    // ── Private helpers — each independently fault-tolerant ─────────────────

    private StatsResponse fetchStats(Long userId) {
        try {
            return dashboardService.getStats(userId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Stats fetch failed for userId={}: {}", userId, e.getMessage());
            return StatsResponse.builder()
                    .totalTrips(0L)
                    .ongoingTrips(0L)
                    .completedTrips(0L)
                    .upcomingTrips(0L)
                    .build();
        }
    }

    private List<TripResponse> fetchTrips(Long userId) {
        try {
            return bookingService.getTripsByUserId(userId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Trips fetch failed for userId={}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<DocumentResponse> fetchDocuments(Long userId) {
        try {
            return documentService.getDocumentsByUserId(userId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Documents fetch failed for userId={}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<PackageResponse> fetchRecommendations(Long userId) {
        try {
            return recommendationService.getRecommendations(userId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Recommendations fetch failed for userId={}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }
}
