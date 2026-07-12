package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.dto.response.TopicResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Package;
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
            List<PackageResponse> pkgs = new ArrayList<>();
            for (String category : categories) {
                pkgs.addAll(packageService.getPackagesByCategory(category));
            }

            // Filter packages with rating >= 3.0
            recommendations = pkgs.stream()
                    .filter(p -> p.getRating() != null && p.getRating() >= 3.0)
                    .collect(Collectors.toList());

            // Step 4 — Sort by rating DESCENDING (Highest first)
            recommendations.sort((a, b) -> Double.compare(
                    b.getRating() != null ? b.getRating() : 0.0,
                    a.getRating() != null ? a.getRating() : 0.0
            ));

            // Remove duplicates just in case
            recommendations = recommendations.stream()
                    .distinct()
                    .collect(Collectors.toList());

            // Limit to top 5
            if (recommendations.size() > 5) {
                recommendations = recommendations.subList(0, 5);
            }

            return recommendations;
        }

        // Fallback: Only when the user has NO completed bookings
        List<PackageResponse> trending = packageService.getTrendingPackages()
                .stream()
                .filter(p -> p.getRating() != null && p.getRating() >= 3.0)
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

        // Final Fallback: Fill remaining slots from all packages if still less than 5
        if (recommendations.size() < 5) {
            List<PackageResponse> allPackages = packageService.getAllPackages()
                    .stream()
                    .filter(p -> p.getRating() != null && p.getRating() >= 3.0)
                    .sorted((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0.0,
                            a.getRating() != null ? a.getRating() : 0.0))
                    .collect(Collectors.toList());

            for (PackageResponse pkg : allPackages) {
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

    public List<TopicResponse> getTopicRecommendations(Long userId) {
        // 1. Fetch completed bookings with packages
        List<Booking> completedBookings = bookingRepository.findCompletedBookingsWithPackages();

        // If no completed bookings, fall back to grouping all active packages
        if (completedBookings.isEmpty()) {
            return getFallbackTopics();
        }

        // Get count of completed bookings per category
        Map<String, Long> categoryBookingCounts = completedBookings.stream()
                .filter(b -> b.getPkg() != null && b.getPkg().getCategory() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getPkg().getCategory(),
                        Collectors.counting()
                ));

        // Get distinct packages
        List<Package> completedPackages = completedBookings.stream()
                .map(Booking::getPkg)
                .filter(p -> p != null && p.getCategory() != null && Boolean.TRUE.equals(p.getIsActive()) && "Approved".equalsIgnoreCase(p.getApplicationStatus()))
                .distinct()
                .collect(Collectors.toList());

        if (completedPackages.isEmpty()) {
            return getFallbackTopics();
        }

        // 2. Fetch ratings and review counts in bulk using package-level mapping
        List<PackageResponse> packageResponses = packageService.toPackageResponses(completedPackages);

        // Group packages by category
        Map<String, List<PackageResponse>> packagesByCategory = packageResponses.stream()
                .collect(Collectors.groupingBy(PackageResponse::getCategory));

        List<TopicResponse> topics = new ArrayList<>();
        double threshold = 4.0; // RATING_THRESHOLD

        for (Map.Entry<String, List<PackageResponse>> entry : packagesByCategory.entrySet()) {
            String category = entry.getKey();
            List<PackageResponse> pkgs = entry.getValue();

            // Filter packages with rating >= threshold
            List<PackageResponse> selectedPkgs = pkgs.stream()
                    .filter(p -> p.getRating() != null && p.getRating() >= threshold)
                    .collect(Collectors.toList());

            if (selectedPkgs.isEmpty()) {
                // Fallback to top-rated packages in that category
                selectedPkgs = new ArrayList<>(pkgs);
            }

            // Sort packages by rating DESC
            selectedPkgs.sort((a, b) -> Double.compare(
                    b.getRating() != null ? b.getRating() : 0.0,
                    a.getRating() != null ? a.getRating() : 0.0
            ));

            // Limit top packages to 5
            if (selectedPkgs.size() > 5) {
                selectedPkgs = selectedPkgs.subList(0, 5);
            }

            // Calculate category average rating based on all completed packages in this category
            double catAvgRating = pkgs.stream()
                    .mapToDouble(p -> p.getRating() != null ? p.getRating() : 0.0)
                    .average()
                    .orElse(0.0);
            double roundedCatAvgRating = Math.round(catAvgRating * 10.0) / 10.0;

            topics.add(TopicResponse.builder()
                    .category(category)
                    .averageRating(roundedCatAvgRating)
                    .packages(selectedPkgs)
                    .build());
        }

        // Sort categories by relevance (total completed bookings DESC, then average rating DESC)
        topics.sort((t1, t2) -> {
            long count1 = categoryBookingCounts.getOrDefault(t1.getCategory(), 0L);
            long count2 = categoryBookingCounts.getOrDefault(t2.getCategory(), 0L);
            if (count1 != count2) {
                return Long.compare(count2, count1);
            }
            return Double.compare(t2.getAverageRating(), t1.getAverageRating());
        });

        return topics;
    }

    private List<TopicResponse> getFallbackTopics() {
        List<PackageResponse> allPackages = packageService.getAllPackages();
        if (allPackages.isEmpty()) {
            return List.of();
        }

        Map<String, List<PackageResponse>> packagesByCategory = allPackages.stream()
                .collect(Collectors.groupingBy(PackageResponse::getCategory));

        List<TopicResponse> topics = new ArrayList<>();
        double threshold = 4.0;

        for (Map.Entry<String, List<PackageResponse>> entry : packagesByCategory.entrySet()) {
            String category = entry.getKey();
            List<PackageResponse> pkgs = entry.getValue();

            List<PackageResponse> selectedPkgs = pkgs.stream()
                    .filter(p -> p.getRating() != null && p.getRating() >= threshold)
                    .collect(Collectors.toList());

            if (selectedPkgs.isEmpty()) {
                selectedPkgs = new ArrayList<>(pkgs);
            }

            selectedPkgs.sort((a, b) -> Double.compare(
                    b.getRating() != null ? b.getRating() : 0.0,
                    a.getRating() != null ? a.getRating() : 0.0
            ));

            if (selectedPkgs.size() > 5) {
                selectedPkgs = selectedPkgs.subList(0, 5);
            }

            double catAvgRating = pkgs.stream()
                    .mapToDouble(p -> p.getRating() != null ? p.getRating() : 0.0)
                    .average()
                    .orElse(0.0);
            double roundedCatAvgRating = Math.round(catAvgRating * 10.0) / 10.0;

            topics.add(TopicResponse.builder()
                    .category(category)
                    .averageRating(roundedCatAvgRating)
                    .packages(selectedPkgs)
                    .build());
        }

        topics.sort((t1, t2) -> Double.compare(t2.getAverageRating(), t1.getAverageRating()));
        return topics;
    }
}