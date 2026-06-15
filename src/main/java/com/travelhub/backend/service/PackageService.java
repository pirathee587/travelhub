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

/**
 * PackageService manages the business logic for browsing travel packages.
 * It provides methods for list-view summaries and detailed package views with reviews and itineraries.
 */
@Service
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Constructor injection for required repositories.
     */
    public PackageService(PackageRepository packageRepository, ReviewRepository reviewRepository) {
        this.packageRepository = packageRepository;
        this.reviewRepository = reviewRepository;
    }

    /**
     * Retrieves all active travel packages available in the system.
     */
    public List<PackageResponse> getAllPackages() {
        List<Package> packages = packageRepository.findByIsActiveTrue();
        return toPackageResponses(packages);
    }

    /**
     * Retrieves active packages filtered by a specific category (e.g., "Adventure").
     */
    public List<PackageResponse> getPackagesByCategory(String category) {
        List<Package> packages = packageRepository.findByCategory(category);
        return toPackageResponses(packages);
    }

    /**
     * Retrieves active packages that are currently flagged as trending.
     */
    public List<PackageResponse> getTrendingPackages() {
        List<Package> packages = packageRepository.findByTrendingTrue();
        return toPackageResponses(packages);
    }

    /**
     * Retrieves the comprehensive details for a specific package including its full itinerary.
     */
    public PackageDetailResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
        return toPackageDetailResponse(pkg);
    }

    /**
     * Optimized method to convert a list of Package entities into PackageResponse DTOs.
     * Performs a batch lookup for ratings and review counts to avoid the N+1 problem.
     */
    private List<PackageResponse> toPackageResponses(List<Package> packages) {
        if (packages.isEmpty()) return List.of();

        List<Long> packageIds = packages.stream().map(Package::getId).collect(Collectors.toList());

        // Efficiently fetch average ratings and review counts in bulk
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByPackageIds(packageIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByPackageIds(packageIds);

        return packages.stream()
                .map(pkg -> toPackageResponse(pkg,
                        avgRatings.getOrDefault(pkg.getId(), 0.0),
                        reviewCounts.getOrDefault(pkg.getId(), 0L).intValue()))
                .collect(Collectors.toList());
    }

    /**
     * Maps a single Package entity to its summary response DTO.
     */
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
        
        // Safely extract agent name
        try {
            if (pkg.getAgent() != null && pkg.getAgent().getUser() != null) {
                response.setAgentName(pkg.getAgent().getUser().getName());
            } else {
                response.setAgentName("Unknown Agent");
            }
        } catch (Exception e) {
            response.setAgentName("Unknown Agent");
        }
        response.setDistrict(pkg.getDistrict());
        return response;
    }

    /**
     * Maps a Package entity to its detailed response DTO, including images and itineraries.
     */
    private PackageDetailResponse toPackageDetailResponse(Package pkg) {
        // Map daily itinerary plans
        List<PackageDetailResponse.ItineraryDayResponse> itineraryDays = null;
        if (pkg.getItinerary() != null) {
            itineraryDays = pkg.getItinerary()
                    .stream()
                    .map(this::toItineraryDayResponse)
                    .collect(Collectors.toList());
        }

        // Extract gallery image URLs
        List<String> imageUrls = null;
        if (pkg.getImages() != null) {
            imageUrls = pkg.getImages()
                    .stream()
                    .map(img -> img.getImageUrl())
                    .collect(Collectors.toList());
        }

        // Fetch specific rating and review count for this single package
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
        
        // Safely extract detailed agent information
        try {
            if (pkg.getAgent() != null) {
                response.setAgentId(pkg.getAgent().getId());
                if (pkg.getAgent().getUser() != null) {
                    response.setAgentName(pkg.getAgent().getUser().getName());
                    response.setAgentPhone(pkg.getAgent().getUser().getTelephone());
                }
                response.setAgentRating(pkg.getAgent().getRating());
            }
        } catch (Exception e) {
            response.setAgentName("Unknown Agent");
        }
        response.setItinerary(itineraryDays);
        response.setImages(imageUrls);
        response.setDistrict(pkg.getDistrict());
        return response;
    }

    /**
     * Maps an individual ItineraryDay entity to its response DTO.
     * Includes logic to parse the activities string (potentially JSON-like array) into a clean list.
     */
    private PackageDetailResponse.ItineraryDayResponse toItineraryDayResponse(PackageItinerary day) {
        List<String> activities = null;
        if (day.getActivities() != null) {
            String raw = day.getActivities().trim();
            // Basic cleanup of bracket notation if present
            if (raw.startsWith("[")) {
                raw = raw.substring(1, raw.length() - 1);
            }
            // Split by comma while respecting potential quotes (simple regex-based parser)
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