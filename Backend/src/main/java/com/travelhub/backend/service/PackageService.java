package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.PackageItinerary;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;

    public List<PackageResponse> getAllPackages() {
        return packageRepository.findByIsActiveTrue()
                .stream()
                .map(this::toPackageResponse)
                .collect(Collectors.toList());
    }

    public List<PackageResponse> getPackagesByCategory(String category) {
        return packageRepository.findByCategory(category)
                .stream()
                .map(this::toPackageResponse)
                .collect(Collectors.toList());
    }

    public List<PackageResponse> getTrendingPackages() {
        return packageRepository.findByTrendingTrue()
                .stream()
                .map(this::toPackageResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PackageDetailResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
        return toPackageDetailResponse(pkg);
    }

    private PackageResponse toPackageResponse(Package pkg) {
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
                .rating(reviewRepository.getAverageRatingByPackageId(pkg.getId()) != null ?
                        Math.round(reviewRepository.getAverageRatingByPackageId(pkg.getId()) * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewRepository.getReviewCountByPackageId(pkg.getId()) != null ?
                        reviewRepository.getReviewCountByPackageId(pkg.getId()).intValue() : 0)
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
                .imageUrl(pkg.getImageUrl()).rating(reviewRepository.getAverageRatingByPackageId(pkg.getId()) != null ?
                        Math.round(reviewRepository.getAverageRatingByPackageId(pkg.getId()) * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewRepository.getReviewCountByPackageId(pkg.getId()) != null ?
                        reviewRepository.getReviewCountByPackageId(pkg.getId()).intValue() : 0)
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
            activities = Arrays.asList(day.getActivities().split(","));
        }
        return PackageDetailResponse.ItineraryDayResponse.builder()
                .dayNumber(day.getDayNumber())
                .title(day.getTitle())
                .description(day.getDescription())
                .activities(activities)
                .build();
    }

    // ── Chatbot data method ────────────────────────────────────────────────
    // Added for AI chatbot feature — returns all active packages as simple maps
    // so the Python RAG service can load them into ChromaDB
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPackagesForChatbot() {
        return packageRepository.findByIsActiveTrue()
                .stream()
                .map(pkg -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id",              pkg.getId());
                    map.put("packageName",     pkg.getPackageName());
                    map.put("destination",     pkg.getDestination());
                    map.put("district",        pkg.getDistrict());
                    map.put("category",        pkg.getCategory());
                    map.put("priceFrom",       pkg.getPriceFrom());
                    map.put("priceTo",         pkg.getPriceTo());
                    map.put("duration",        pkg.getDuration());
                    map.put("rating",          pkg.getRating());
                    map.put("festivalDetails", pkg.getFestivalDetails());
                    map.put("startPlace",      pkg.getStartPlace());
                    map.put("endPlace",        pkg.getEndPlace());
                    try {
                        map.put("agentName", pkg.getAgent() != null ? pkg.getAgent().getAgentName() : "");
                    } catch (Exception e) {
                        map.put("agentName", "");
                    }
                    return map;
                })
                .collect(Collectors.toList());
    }
}