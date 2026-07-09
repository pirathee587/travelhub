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
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;
    private final AgentRatingCalculator agentRatingCalculator;

    public List<PackageResponse> getAllPackages() {
        List<Package> packages = packageRepository.findByIsActiveTrue()
                .stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApplicationStatus())) //Approved package
                .collect(Collectors.toList());
        return toPackageResponses(packages);
    }

    public List<PackageResponse> getPackagesByCategory(String category) {
        List<Package> packages = packageRepository.findByCategory(category)
                .stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApplicationStatus()) && Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());
        return toPackageResponses(packages);
    }

    public List<PackageResponse> getTrendingPackages() {
        List<Package> packages = packageRepository.findByTrendingTrue()
                .stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApplicationStatus()) && Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());
        return toPackageResponses(packages);
    }

    /**
     * Returns all active packages belonging to a given agent (by surrogate agent id).
     * Now that Package.@JoinColumn is corrected (no referencedColumnName), this works correctly.
     */
    public List<PackageResponse> getPackagesByAgentId(Long agentId) {
        List<Package> packages = packageRepository.findByAgentId(agentId)
                .stream()
                .filter(p -> "Approved".equalsIgnoreCase(p.getApplicationStatus()) && Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());
        return toPackageResponses(packages);
    }

    public PackageDetailResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));   //Error handling for package not found
        return toPackageDetailResponse(pkg);
    }

    /**
     * ✅ OPTIMIZED: Batch rating lookup — 2 queries total instead of 2N.
     * For a list of 10 packages, this saves 18 DB roundtrips.
     */
    public List<PackageResponse> toPackageResponses(List<Package> packages) {
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

    private String getSafeAgentName(com.travelhub.backend.entity.Agent agent) {
        if (agent == null) return null;
        try {
            return agent.getAgencyName();
        } catch (jakarta.persistence.EntityNotFoundException | org.hibernate.ObjectNotFoundException e) {
            return "Unknown Agent";
        }
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
                .agentName(getSafeAgentName(pkg.getAgent()))
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

        Long aId = null;
        String aName = null;
        String aPhone = null;
        Double aRating = null;
        try {
            if (pkg.getAgent() != null) {
                aId = pkg.getAgent().getId();
                aName = pkg.getAgent().getAgencyName();
                aPhone = pkg.getAgent().getOwner() != null
                        ? pkg.getAgent().getOwner().getTelephone()
                        : null;
                aRating = agentRatingCalculator.getAgentRating(aId);
            }
        } catch (jakarta.persistence.EntityNotFoundException | org.hibernate.ObjectNotFoundException e) {
            aName = "Unknown Agent";
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
                .imageUrl(pkg.getImageUrl())
                .rating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(count != null ? count.intValue() : 0)
                .festivalDetails(pkg.getFestivalDetails())
                .trending(pkg.getTrending())
                .agentId(aId)
                .agentName(aName)
                .agentPhone(aPhone)
                .agentRating(aRating)
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
    // ── Chatbot data method ────────────────────────────────────────────────
    // Added for AI chatbot feature — returns all active packages as simple maps
    // so the Python RAG service can load them into ChromaDB
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPackagesForChatbot() {
    // Use a fresh query to avoid lazy loading issues with Agent relationship
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
                // Safely get agent name — avoid null pointer if agent is null
                try {
                    map.put("agentName", pkg.getAgent() != null ? pkg.getAgent().getAgencyName() : "");
                } catch (Exception e) {
                    map.put("agentName", "");
                }
                return map;
            })
            .collect(Collectors.toList());
}
}
