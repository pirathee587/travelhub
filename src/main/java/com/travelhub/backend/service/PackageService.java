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

@Service
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;

    public PackageService(PackageRepository packageRepository, ReviewRepository reviewRepository) {
        this.packageRepository = packageRepository;
        this.reviewRepository = reviewRepository;
    }

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
     */
    private List<PackageResponse> toPackageResponses(List<Package> packages) {
        if (packages.isEmpty()) return List.of();

        List<Long> packageIds = packages.stream().map(Package::getId).collect(Collectors.toList());

        // bulk queries
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByPackageIds(packageIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByPackageIds(packageIds);

        return packages.stream()
                .map(pkg -> toPackageResponse(pkg,
                        avgRatings.getOrDefault(pkg.getId(), 0.0),
                        reviewCounts.getOrDefault(pkg.getId(), 0L).intValue()))
                .collect(Collectors.toList());
    }

    private PackageResponse toPackageResponse(Package pkg, double rating, int reviewCount) {
        PackageResponse response = new PackageResponse();
        response.setId(pkg.getId());
        response.setPackageName(pkg.getPackageName());
        response.setDestination(pkg.getDestination());
        response.setStartPlace(pkg.getStartPlace());
        response.setEndPlace(pkg.getEndPlace());
        response.setPriceFrom(pkg.getPriceFrom());
        response.setPriceTo(pkg.getPriceTo());
        response.setDuration(pkg.getDuration());
        response.setCategory(pkg.getCategory());
        response.setImageUrl(pkg.getImageUrl());
        response.setRating(Math.round(rating * 10.0) / 10.0);
        response.setReviewCount(reviewCount);
        response.setFestivalDetails(pkg.getFestivalDetails());
        response.setTrending(pkg.getTrending());
        response.setAgentName(pkg.getAgent() != null ? pkg.getAgent().getUser().getName() : null);
        response.setDistrict(pkg.getDistrict());
        return response;
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

        // Single detail page fetch
        Double avgRating = reviewRepository.getAverageRatingByPackageId(pkg.getId());
        Long count = reviewRepository.getReviewCountByPackageId(pkg.getId());

        PackageDetailResponse response = new PackageDetailResponse();
        response.setId(pkg.getId());
        response.setPackageName(pkg.getPackageName());
        response.setDestination(pkg.getDestination());
        response.setStartPlace(pkg.getStartPlace());
        response.setEndPlace(pkg.getEndPlace());
        response.setPriceFrom(pkg.getPriceFrom());
        response.setPriceTo(pkg.getPriceTo());
        response.setDuration(pkg.getDuration());
        response.setCategory(pkg.getCategory());
        response.setImageUrl(pkg.getImageUrl());
        response.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.setReviewCount(count != null ? count.intValue() : 0);
        response.setFestivalDetails(pkg.getFestivalDetails());
        response.setTrending(pkg.getTrending());
        response.setAgentId(pkg.getAgent() != null ? pkg.getAgent().getId() : null);
        response.setAgentName(pkg.getAgent() != null ? pkg.getAgent().getUser().getName() : null);
        response.setAgentPhone(pkg.getAgent() != null ? pkg.getAgent().getUser().getTelephone() : null);
        response.setAgentRating(pkg.getAgent() != null ? pkg.getAgent().getRating() : null);
        response.setItinerary(itineraryDays);
        response.setImages(imageUrls);
        response.setDistrict(pkg.getDistrict());
        return response;
    }

    private PackageDetailResponse.ItineraryDayResponse toItineraryDayResponse(PackageItinerary day) {
        List<String> activities = null;
        if (day.getActivities() != null) {
            String raw = day.getActivities().trim();
            if (raw.startsWith("[")) {
                raw = raw.substring(1, raw.length() - 1);
            }
            activities = Arrays.stream(raw.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                    .map(s -> s.trim().replaceAll("^\"|\"$", "").trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        PackageDetailResponse.ItineraryDayResponse response = new PackageDetailResponse.ItineraryDayResponse();
        response.setDayNumber(day.getDayNumber());
        response.setTitle(day.getTitle());
        response.setDescription(day.getDescription());
        response.setActivities(activities);
        return response;
    }
}