package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.*;
import com.travelhub.backend.entity.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Dedicated API Aggregator Service for the Tourist Portal.
 *
 * Safe, non-intrusive orchestrator that consolidates multiple related service calls
 * into single backend-aggregated responses.
 *
 * Concurrency & Fault Tolerance:
 * - Each sub-task runs concurrently via CompletableFuture.
 * - Each sub-task is wrapped in an isolated try-catch block so partial failures
 *   never crash the entire page response.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TouristAggregatorService {

    private final DashboardService dashboardService;
    private final BookingService bookingService;

    private final RecommendationService recommendationService;
    private final PackageService packageService;
    private final HotelService hotelService;
    private final RoomService roomService;
    private final ReviewService reviewService;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Tourist Overview Dashboard Aggregator
    // ─────────────────────────────────────────────────────────────────────────

    public TouristOverviewResponse getOverview(Long userId) {
        CompletableFuture<StatsResponse> statsFuture =
                CompletableFuture.supplyAsync(() -> fetchStats(userId));

        CompletableFuture<List<TripResponse>> tripsFuture =
                CompletableFuture.supplyAsync(() -> fetchTrips(userId));

        CompletableFuture<List<PackageResponse>> recommendationsFuture =
                CompletableFuture.supplyAsync(() -> fetchRecommendations(userId));

        CompletableFuture.allOf(statsFuture, tripsFuture, recommendationsFuture).join();

        return TouristOverviewResponse.builder()
                .stats(statsFuture.join())
                .trips(tripsFuture.join())
                .recommendations(recommendationsFuture.join())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Tourist Explore Page Aggregator
    // ─────────────────────────────────────────────────────────────────────────

    public TouristExploreResponse getExploreData(Long userId) {
        CompletableFuture<List<PackageResponse>> packagesFuture =
                CompletableFuture.supplyAsync(this::fetchAllPackages);

        CompletableFuture<List<PackageResponse>> recommendationsFuture =
                CompletableFuture.supplyAsync(() -> fetchRecommendations(userId));

        CompletableFuture.allOf(packagesFuture, recommendationsFuture).join();

        return TouristExploreResponse.builder()
                .packages(packagesFuture.join())
                .recommendations(recommendationsFuture.join())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Tourist Package Details Page Aggregator
    // ─────────────────────────────────────────────────────────────────────────

    public TouristPackageDetailsResponse getPackagePageData(Long packageId) {
        CompletableFuture<PackageDetailResponse> detailsFuture =
                CompletableFuture.supplyAsync(() -> fetchPackageDetails(packageId));

        CompletableFuture<List<ReviewResponse>> reviewsFuture =
                CompletableFuture.supplyAsync(() -> fetchPackageReviews(packageId));

        CompletableFuture<ReviewSummaryResponse> ratingFuture =
                CompletableFuture.supplyAsync(() -> fetchPackageRating(packageId));

        CompletableFuture.allOf(detailsFuture, reviewsFuture, ratingFuture).join();

        return TouristPackageDetailsResponse.builder()
                .packageDetails(detailsFuture.join())
                .reviews(reviewsFuture.join())
                .ratingInfo(ratingFuture.join())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Tourist Hotel Details Page Aggregator
    // ─────────────────────────────────────────────────────────────────────────

    public TouristHotelDetailsResponse getHotelPageData(Long hotelId) {
        CompletableFuture<HotelResponse> hotelFuture =
                CompletableFuture.supplyAsync(() -> fetchHotelDetails(hotelId));

        CompletableFuture<List<RoomResponse>> roomsFuture =
                CompletableFuture.supplyAsync(() -> fetchHotelRooms(hotelId));

        CompletableFuture<List<ReviewResponse>> reviewsFuture =
                CompletableFuture.supplyAsync(() -> fetchHotelReviews(hotelId));

        CompletableFuture<ReviewSummaryResponse> ratingFuture =
                CompletableFuture.supplyAsync(() -> fetchHotelRating(hotelId));

        CompletableFuture.allOf(hotelFuture, roomsFuture, reviewsFuture, ratingFuture).join();

        HotelResponse hotel = hotelFuture.join();
        List<String> images = hotel != null && hotel.getImages() != null ? hotel.getImages() : Collections.emptyList();

        return TouristHotelDetailsResponse.builder()
                .hotel(hotel)
                .images(images)
                .rooms(roomsFuture.join())
                .reviews(reviewsFuture.join())
                .ratingInfo(ratingFuture.join())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers with Isolated Error Handling
    // ─────────────────────────────────────────────────────────────────────────

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


    private List<PackageResponse> fetchRecommendations(Long userId) {
        if (userId == null) return Collections.emptyList();
        try {
            return recommendationService.getRecommendations(userId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Recommendations fetch failed for userId={}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<PackageResponse> fetchAllPackages() {
        try {
            return packageService.getAllPackages();
        } catch (Exception e) {
            log.warn("[TouristAggregator] All packages fetch failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private PackageDetailResponse fetchPackageDetails(Long packageId) {
        try {
            return packageService.getPackageById(packageId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Package details fetch failed for packageId={}: {}", packageId, e.getMessage());
            return null;
        }
    }

    private List<ReviewResponse> fetchPackageReviews(Long packageId) {
        try {
            return reviewService.getPackageReviews(packageId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Package reviews fetch failed for packageId={}: {}", packageId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private ReviewSummaryResponse fetchPackageRating(Long packageId) {
        try {
            return ReviewSummaryResponse.builder()
                    .averageRating(reviewService.getAveragePackageRating(packageId))
                    .reviewCount(reviewService.getPackageReviewCount(packageId))
                    .build();
        } catch (Exception e) {
            log.warn("[TouristAggregator] Package rating fetch failed for packageId={}: {}", packageId, e.getMessage());
            return ReviewSummaryResponse.builder().averageRating(0.0).reviewCount(0L).build();
        }
    }

    private HotelResponse fetchHotelDetails(Long hotelId) {
        try {
            return hotelService.getHotelById(hotelId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Hotel details fetch failed for hotelId={}: {}", hotelId, e.getMessage());
            return null;
        }
    }

    private List<RoomResponse> fetchHotelRooms(Long hotelId) {
        try {
            List<Room> rooms = roomService.getRoomsByHotelId(hotelId);
            if (rooms == null) return Collections.emptyList();
            return rooms.stream()
                    .map(r -> new RoomResponse(
                            r.getId(),
                            r.getName(),
                            r.getType(),
                            r.getPrice(),
                            r.getDescription(),
                            r.getImageUrl(),
                            r.getAvailability(),
                            hotelId
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("[TouristAggregator] Hotel rooms fetch failed for hotelId={}: {}", hotelId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<ReviewResponse> fetchHotelReviews(Long hotelId) {
        try {
            return reviewService.getHotelReviews(hotelId);
        } catch (Exception e) {
            log.warn("[TouristAggregator] Hotel reviews fetch failed for hotelId={}: {}", hotelId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private ReviewSummaryResponse fetchHotelRating(Long hotelId) {
        try {
            return ReviewSummaryResponse.builder()
                    .averageRating(reviewService.getAverageHotelRating(hotelId))
                    .reviewCount(reviewService.getHotelReviewCount(hotelId))
                    .build();
        } catch (Exception e) {
            log.warn("[TouristAggregator] Hotel rating fetch failed for hotelId={}: {}", hotelId, e.getMessage());
            return ReviewSummaryResponse.builder().averageRating(0.0).reviewCount(0L).build();
        }
    }
}
