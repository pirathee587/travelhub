package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final BookingRepository bookingRepository;
    private final PackageService packageService;

    public List<PackageResponse> getRecommendations(Long userId) {

        // Step 1 — Get user's completed bookings
        List<Booking> completedBookings = bookingRepository
                .findByUserIdAndStatus(userId, "completed");

        // Step 2 — Identify categories from completed bookings
        Set<String> categories = completedBookings.stream()
                .map(b -> b.getPkg().getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<PackageResponse> recommendations = new ArrayList<>();

        if (!categories.isEmpty()) {
            // Step 3 — Find all packages in those categories
            for (String category : categories) {
                recommendations.addAll(packageService.getPackagesByCategory(category));
            }

            // Step 4 — Sort by rating DESC (highest first)
            recommendations.sort((a, b) -> Double.compare(
                    b.getRating() != null ? b.getRating() : 0.0,
                    a.getRating() != null ? a.getRating() : 0.0
            ));

            // Remove duplicates just in case
            recommendations = recommendations.stream()
                    .distinct()
                    .limit(5) // Step 5 — Return top 5 packages
                    .collect(Collectors.toList());
        }

        // Fallback: Fill remaining slots with top trending packages if less than 5
        if (recommendations.size() < 5) {
            List<PackageResponse> trending = packageService.getTrendingPackages()
                    .stream()
                    .sorted((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0.0,
                            a.getRating() != null ? a.getRating() : 0.0))
                    .collect(Collectors.toList());

            for (PackageResponse pkg : trending) {
                if (recommendations.size() >= 5) break;
                if (recommendations.stream().noneMatch(r -> r.getId().equals(pkg.getId()))) {
                    recommendations.add(pkg);
                }
            }
        }

        // Sort the final combined list to ensure strict descending rating order
        recommendations.sort((a, b) -> Double.compare(
                b.getRating() != null ? b.getRating() : 0.0,
                a.getRating() != null ? a.getRating() : 0.0
        ));

        return recommendations;
    }
}