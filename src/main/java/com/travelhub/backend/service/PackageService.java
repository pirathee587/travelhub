package com.travelhub.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.PackageItinerary;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.HotelRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final ReviewRepository reviewRepository;
    private final HotelRepository hotelRepository;
    private final AgentRatingCalculator agentRatingCalculator;

    public List<PackageResponse> getAllPackages() {
        List<Package> packages = packageRepository.findByIsActiveTrue()
                .stream()
                .filter(p -> p.getApplicationStatus() != null && "Approved".equalsIgnoreCase(p.getApplicationStatus().trim())) //Approved package
                .collect(Collectors.toList());
        return toPackageResponses(packages);
    }

    public List<PackageResponse> getPackagesByCategory(String category) {
        List<Package> packages = packageRepository.findByCategory(category)
                .stream()
                .filter(p -> p.getApplicationStatus() != null && "Approved".equalsIgnoreCase(p.getApplicationStatus().trim()) && Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toList());
        return toPackageResponses(packages);
    }

    public List<PackageResponse> getTrendingPackages() {
        List<Package> packages = packageRepository.findByTrendingTrue()
                .stream()
                .filter(p -> p.getApplicationStatus() != null && "Approved".equalsIgnoreCase(p.getApplicationStatus().trim()) && Boolean.TRUE.equals(p.getIsActive()))
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
                .filter(p -> p.getApplicationStatus() != null && "Approved".equalsIgnoreCase(p.getApplicationStatus().trim()) && Boolean.TRUE.equals(p.getIsActive()))
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
                .startPlace(pkg.getStartPlace())
                .endPlace(pkg.getEndPlace())
                .priceFrom(pkg.getPriceFrom())
                .priceTo(pkg.getPriceTo())
                .basePriceAdult(pkg.getBasePriceAdult())
                .basePriceChild(pkg.getBasePriceChild())
                .duration(pkg.getDuration())
                .category(pkg.getCategory())
                .imageUrl(pkg.getImageUrl())
                .rating(Math.round(rating * 10.0) / 10.0)
                .reviewCount(reviewCount)
                .agentName(getSafeAgentName(pkg.getAgent()))
                .district(pkg.getDistrict())
                .packageType(pkg.getPackageType())
                .build();
    }

    private PackageDetailResponse toPackageDetailResponse(Package pkg) {
        Double avgRating = reviewRepository.getAverageRatingByPackageId(pkg.getId());
        Long count = reviewRepository.getReviewCountByPackageId(pkg.getId());

        Long aId = null;
        String aName = null;
        String aPhone = null;
        Double aRating = 0.0;

        if (pkg.getAgent() != null) {
            try {
                aId = pkg.getAgent().getId();
                aName = pkg.getAgent().getAgencyName();
                aPhone = pkg.getAgent().getAgencyNumber();
                aRating = pkg.getAgent().getRating() != null ? pkg.getAgent().getRating() : 0.0;
            } catch (jakarta.persistence.EntityNotFoundException | org.hibernate.ObjectNotFoundException e) {
                aName = "Unknown Agent";
            }
        }

        List<PackageDetailResponse.ItineraryDayResponse> itineraryDays = pkg.getItinerary().stream()
                .sorted((a, b) -> (a.getDayNumber() != null ? a.getDayNumber() : 0) - (b.getDayNumber() != null ? b.getDayNumber() : 0))
                .map(this::toItineraryDayResponse)
                .collect(Collectors.toList());

        List<String> imageUrls = pkg.getImages().stream()
                .sorted((a, b) -> (a.getDisplayOrder() != null ? a.getDisplayOrder() : 0) - (b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList());

        List<String> inclusionsList = pkg.getInclusions() != null && !pkg.getInclusions().isEmpty()
                ? Arrays.stream(pkg.getInclusions().split(",")).map(String::trim).collect(Collectors.toList())
                : new java.util.ArrayList<>();

        return PackageDetailResponse.builder()
                .id(pkg.getId())
                .packageName(pkg.getPackageName())
                .startPlace(pkg.getStartPlace())
                .endPlace(pkg.getEndPlace())
                .priceFrom(pkg.getPriceFrom())
                .priceTo(pkg.getPriceTo())
                .basePriceAdult(pkg.getBasePriceAdult())
                .basePriceChild(pkg.getBasePriceChild())
                .duration(pkg.getDuration())
                .category(pkg.getCategory())
                .imageUrl(pkg.getImageUrl())
                .rating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(count != null ? count.intValue() : 0)
                .agentId(aId)
                .agentName(aName)
                .agentPhone(aPhone)
                .agentRating(aRating)
                .itinerary(itineraryDays)
                .images(imageUrls)
                .inclusions(inclusionsList)
                .district(pkg.getDistrict())
                .packageType(pkg.getPackageType())
                .build();
    }

    private PackageDetailResponse.ItineraryDayResponse toItineraryDayResponse(PackageItinerary day) {
        List<PackageDetailResponse.PackageActivityResponse> activities = null;
        if (day.getActivities() != null) {
            String raw = day.getActivities().trim();
            if (!raw.isEmpty()) {
                activities = new java.util.ArrayList<>();
                if (raw.startsWith("[") || raw.startsWith("{")) {
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(raw);
                        if (node.isArray()) {
                            for (com.fasterxml.jackson.databind.JsonNode item : node) {
                                if (item.isObject()) {
                                    String desc = null;
                                    String imgUrl = null;
                                    if (item.has("description")) {
                                        desc = item.get("description").asText();
                                    } else if (item.has("text")) {
                                        desc = item.get("text").asText();
                                    } else if (item.has("name")) {
                                        desc = item.get("name").asText();
                                    } else {
                                        desc = item.toString();
                                    }
                                    if (item.has("imageUrl")) {
                                        imgUrl = item.get("imageUrl").asText();
                                        if ("null".equalsIgnoreCase(imgUrl) || imgUrl.trim().isEmpty()) {
                                            imgUrl = null;
                                        }
                                    }
                                    activities.add(new PackageDetailResponse.PackageActivityResponse(desc, imgUrl));
                                } else if (item.isValueNode()) {
                                    activities.add(new PackageDetailResponse.PackageActivityResponse(item.asText(), null));
                                }
                            }
                        } else if (node.isObject()) {
                            String desc = null;
                            String imgUrl = null;
                            if (node.has("description")) {
                                desc = node.get("description").asText();
                            } else {
                                desc = node.toString();
                            }
                            if (node.has("imageUrl")) {
                                imgUrl = node.get("imageUrl").asText();
                                if ("null".equalsIgnoreCase(imgUrl) || imgUrl.trim().isEmpty()) {
                                    imgUrl = null;
                                }
                            }
                            activities.add(new PackageDetailResponse.PackageActivityResponse(desc, imgUrl));
                        } else {
                            activities.add(new PackageDetailResponse.PackageActivityResponse(node.asText(), null));
                        }
                    } catch (Exception e) {
                        // Fallback on JSON parse error
                        if (raw.startsWith("[")) {
                            raw = raw.substring(1, raw.length() - 1);
                        }
                        List<String> list = Arrays.stream(raw.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                                .map(s -> s.trim().replaceAll("^\"|\"$", "").trim())
                                .filter(s -> !s.isEmpty())
                                .collect(Collectors.toList());
                        for (String str : list) {
                            activities.add(new PackageDetailResponse.PackageActivityResponse(str, null));
                        }
                    }
                } else {
                    List<String> list = Arrays.stream(raw.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                            .map(s -> s.trim().replaceAll("^\"|\"$", "").trim())
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList());
                    for (String str : list) {
                        activities.add(new PackageDetailResponse.PackageActivityResponse(str, null));
                    }
                }
            }
        }

        String hotelName = null;
        if (day.getHotel() != null) {
            hotelName = day.getHotel().getHotelName();
        } else if (day.getHotelNameCustom() != null && !day.getHotelNameCustom().trim().isEmpty()) {
            hotelName = day.getHotelNameCustom().trim();
        }

        Long hotelId = day.getHotel() != null ? day.getHotel().getId() : null;

        return PackageDetailResponse.ItineraryDayResponse.builder()
                .dayNumber(day.getDayNumber())
                .title(day.getTitle())
                .description(day.getDescription())
                .activities(activities)
                .hotelName(hotelName)
                .hotelId(hotelId)
                .build();
    }

    // ── Chatbot data method ────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPackagesForChatbot() {
        return packageRepository.findByIsActiveTrue()
                .stream()
                .map(pkg -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id",              pkg.getId());
                    map.put("packageName",     pkg.getPackageName());
                    map.put("district",        pkg.getDistrict());
                    map.put("category",        pkg.getCategory());
                    map.put("duration",        pkg.getDuration());
                    map.put("rating",          pkg.getRating());
                    map.put("startPlace",      pkg.getStartPlace());
                    map.put("endPlace",        pkg.getEndPlace());
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
