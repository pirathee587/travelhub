package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookingRepository bookingRepository;
    private final PackageService packageService;

    public List<PackageResponse> getRecommendations(Long userId) {

        // Step 1 — Get user's completed bookings
        List<Booking> completedBookings = bookingRepository
                .findByUserIdAndStatus(userId, "completed");

        // Step 2 — No bookings → top 5 trending by rating
        if (completedBookings.isEmpty()) {
            return packageService.getTrendingPackages()
                    .stream()
                    .sorted((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0,
                            a.getRating() != null ? a.getRating() : 0))
                    .limit(5)
                    .collect(Collectors.toList());
        }

        // Step 3 — Count bookings per category
        Map<String, Long> categoryCount = completedBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getPkg().getCategory(),
                        Collectors.counting()
                ));

        long totalBookings = completedBookings.size();
        int totalRecommendations = 5;

        // Step 4 — Top 5 categories only (sorted by booking count)
        List<Map.Entry<String, Long>> sortedCategories = categoryCount.entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(totalRecommendations)
                .collect(Collectors.toList());

        // Step 5 — Give 1 slot to each category first
        Map<String, Integer> categorySlots = new LinkedHashMap<>();
        for (Map.Entry<String, Long> entry : sortedCategories) {
            categorySlots.put(entry.getKey(), 1);
        }

        // Step 6 — Distribute remaining slots by proportion
        int remainingSlots = totalRecommendations - sortedCategories.size();
        for (int i = 0; i < sortedCategories.size() && remainingSlots > 0; i++) {
            Map.Entry<String, Long> entry = sortedCategories.get(i);
            int extraSlots = (int) Math.round(
                    (double) entry.getValue() / totalBookings * remainingSlots
            );
            extraSlots = Math.min(extraSlots, remainingSlots);
            categorySlots.put(entry.getKey(),
                    categorySlots.get(entry.getKey()) + extraSlots);
            remainingSlots -= extraSlots;
        }

        // Step 7 — Give leftover slots to top category
        if (remainingSlots > 0) {
            String topCategory = sortedCategories.get(0).getKey();
            categorySlots.put(topCategory,
                    categorySlots.get(topCategory) + remainingSlots);
        }

        // Step 8 — Pick highest rated packages per category
        List<PackageResponse> recommendations = new ArrayList<>();
        for (Map.Entry<String, Integer> slot : categorySlots.entrySet()) {
            String category = slot.getKey();
            int count = slot.getValue();

            List<PackageResponse> categoryPackages = packageService
                    .getPackagesByCategory(category)
                    .stream()
                    .sorted((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0,
                            a.getRating() != null ? a.getRating() : 0))
                    .limit(count)
                    .collect(Collectors.toList());

            recommendations.addAll(categoryPackages);
        }

        // Step 9 — Fill remaining with trending if less than 5
        if (recommendations.size() < totalRecommendations) {
            packageService.getTrendingPackages()
                    .stream()
                    .sorted((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0,
                            a.getRating() != null ? a.getRating() : 0))
                    .filter(t -> recommendations.stream()
                            .noneMatch(r -> r.getId().equals(t.getId())))
                    .limit(totalRecommendations - recommendations.size())
                    .forEach(recommendations::add);
        }

        return recommendations;
    }
}