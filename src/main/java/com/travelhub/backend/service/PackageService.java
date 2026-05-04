package com.travelhub.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.PackageItinerary;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;

    public List<PackageResponse> getAllPackages() {
        List<Package> packages = packageRepository.findByIsActiveTrue();
        return toPackageResponses(packages);
    }

    public List<PackageResponse> getPackagesByCategory(String category) {
        List<Package> packages = packageRepository.findByCategory(category);
        return toPackageResponses(packages);
    }

    public List<PackageResponse> getTrendingPackages() {
        List<Package> packages = packageRepository.findByTrendingTrue();
        return toPackageResponses(packages);
    }

    public PackageDetailResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
        return toPackageDetailResponse(pkg);
    }

    /**
     * ✅ OPTIMIZED: Batch rating lookup — 2 queries total instead of 2N.
     * For a list of 10 packages, this saves 18 DB roundtrips.
     */
    private List<PackageResponse> toPackageResponses(List<Package> packages) {
        if (packages.isEmpty()) return List.of();

        List<Long> packageIds = packages.stream().map(Package::getId).collect(Collectors.toList());

        // 2 bulk queries instead of 2 per package
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByPackageIds(packageIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByPackageIds(packageIds);

        return packages.stream()
                .map(pkg -> toPackageResponse(pkg,
                        avgRatings.getOrDefault(pkg.getId(), 0.0),
                        reviewCounts.getOrDefault(pkg.getId(), 0L).intValue()))
                .collect(Collectors.toList());
    }

    private PackageResponse toPackageResponse(Package pkg, double rating, int reviewCount) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .packageName(pkg.getPackageName())
                .destination(pkg.getDestination())
                .startPlace(pkg.getStartPlace())
                .endPlace(pkg.getEndPlace())
                .priceFrom(pkg.getPriceFrom())
                .priceTo(pkg.getPriceTo())
                .duration(pkg.getDuration())
                .category(pkg.getCategory())
                .imageUrl(pkg.getImageUrl())
                .rating(Math.round(rating * 10.0) / 10.0)
                .reviewCount(reviewCount)
                .festivalDetails(pkg.getFestivalDetails())
                .trending(pkg.getTrending())
                .agentName(pkg.getAgent() != null ? pkg.getAgent().getAgentName() : null)
                .district(pkg.getDistrict())
                .build();
    }

    private PackageDetailResponse toPackageDetailResponse(Package pkg) {
        List<PackageDetailResponse.ItineraryDayResponse> itineraryDays = null;
        if (pkg.getItinerary() != null) {
            itineraryDays = pkg.getItinerary()
                    .stream()
                    .map(this::toItineraryDayResponse)
                    .collect(Collectors.toList());
        }

        List<String> imageUrls = null;
        if (pkg.getImages() != null) {
            imageUrls = pkg.getImages()
                    .stream()
                    .map(img -> img.getImageUrl())
                    .collect(Collectors.toList());
        }

        // Single detail page — 2 individual queries is fine here
        Double avgRating = reviewRepository.getAverageRatingByPackageId(pkg.getId());
        Long count = reviewRepository.getReviewCountByPackageId(pkg.getId());

        return PackageDetailResponse.builder()
                .id(pkg.getId())
                .packageName(pkg.getPackageName())
                .destination(pkg.getDestination())
                .startPlace(pkg.getStartPlace())
                .endPlace(pkg.getEndPlace())
                .priceFrom(pkg.getPriceFrom())
                .priceTo(pkg.getPriceTo())
                .duration(pkg.getDuration())
                .category(pkg.getCategory())
                .imageUrl(pkg.getImageUrl())
                .rating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(count != null ? count.intValue() : 0)
                .festivalDetails(pkg.getFestivalDetails())
                .trending(pkg.getTrending())
                .agentId(pkg.getAgent() != null ? pkg.getAgent().getId() : null)
                .agentName(pkg.getAgent() != null ? pkg.getAgent().getAgentName() : null)
                .agentPhone(pkg.getAgent() != null ? pkg.getAgent().getPhone() : null)
                .agentRating(pkg.getAgent() != null ? pkg.getAgent().getRating() : null)
                .itinerary(itineraryDays)
                .images(imageUrls)
                .district(pkg.getDistrict())
                .build();
    }

    private PackageDetailResponse.ItineraryDayResponse toItineraryDayResponse(PackageItinerary day) {
        List<String> activities = null;
        if (day.getActivities() != null) {
            String raw = day.getActivities().trim();
            // ✅ FIXED: DB stores JSON array ["activity1","activity2"]
            // Remove [ ] brackets, split by comma, clean quotes and whitespace
            if (raw.startsWith("[")) {
                raw = raw.substring(1, raw.length() - 1);
            }
            activities = Arrays.stream(raw.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                    .map(s -> s.trim().replaceAll("^\"|\"$", "").trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        return PackageDetailResponse.ItineraryDayResponse.builder()
                .dayNumber(day.getDayNumber())
                .title(day.getTitle())
                .description(day.getDescription())
                .activities(activities)
                .build();
    }
}