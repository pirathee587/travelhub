package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

/**
 * RecommendationService provides personalized travel suggestions to users.
 * It uses a content-based filtering approach by analyzing a user's past booking categories and suggesting similar high-rated packages.
 */
@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private final BookingRepository bookingRepository;
    private final PackageService packageService;

    /**
     * Constructor injection for booking history and package discovery.
     */
    public RecommendationService(BookingRepository bookingRepository, PackageService packageService) {
        this.bookingRepository = bookingRepository;
        this.packageService = packageService;
    }

    /**
     * Generates a list of recommended travel packages for a specific user.
     * Logic:
     * 1. Extract categories from the user's completed trips.
     * 2. Find high-rated packages in those categories.
     * 3. Supplement with global trending packages if history is insufficient.
     */
    public List<PackageResponse> getRecommendations(Long userId) {

        // Step 1 — Analyze the user's travel history
        List<Booking> completedBookings = bookingRepository
                .findByUserIdAndStatus(userId, "completed");

        // Step 2 — Identify preferred travel categories (e.g., Adventure, Cultural, Beach)
        Set<String> categories = completedBookings.stream()
                .map(b -> b.getPkg().getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<PackageResponse> recommendations = new ArrayList<>();

        if (!categories.isEmpty()) {
            // Step 3 — Discover new packages within the user's favorite categories
            for (String category : categories) {
                recommendations.addAll(packageService.getPackagesByCategory(category));
            }

            // Step 4 — Rank by quality (Rating DESC)
            recommendations.sort((a, b) -> Double.compare(
                    b.getRating() != null ? b.getRating() : 0.0,
                    a.getRating() != null ? a.getRating() : 0.0
            ));

            // Step 5 — Filter duplicates and limit to top 5 recommendations
            recommendations = recommendations.stream()
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());
        }

        // ── Fallback Strategy ──────────────────────────────
        // If the user is new or has limited history, fill the remaining slots with top-rated trending packages.
        if (recommendations.size() < 5) {
            List<PackageResponse> trending = packageService.getTrendingPackages()
                    .stream()
                    .sorted((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0.0,
                            a.getRating() != null ? a.getRating() : 0.0))
                    .collect(Collectors.toList());

            for (PackageResponse pkg : trending) {
                if (recommendations.size() >= 5) break;
                // Avoid recommending something already in the list
                if (recommendations.stream().noneMatch(r -> r.getId().equals(pkg.getId()))) {
                    recommendations.add(pkg);
                }
            }
        }

        // Final quality-based sort for the combined list
        recommendations.sort((a, b) -> Double.compare(
                b.getRating() != null ? b.getRating() : 0.0,
                a.getRating() != null ? a.getRating() : 0.0
        ));

        return recommendations;
    }
}