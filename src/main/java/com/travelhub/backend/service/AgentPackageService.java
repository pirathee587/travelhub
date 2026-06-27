package com.travelhub.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelhub.backend.dto.request.CreatePackageRequest;
import com.travelhub.backend.dto.request.PackageDayRequest;
import com.travelhub.backend.dto.request.UpdatePackageStatusRequest;
import com.travelhub.backend.dto.response.AgentPackageDetailResponse;
import com.travelhub.backend.dto.response.PackageSummaryResponse;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageItineraryRepository;
import com.travelhub.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentPackageService {

    private final PackageRepository packageRepository;
    private final PackageItineraryRepository itineraryRepository;
    private final HotelRepository hotelRepository;
    private final ImageUploadService imageUploadService;
    private final ObjectMapper objectMapper;

    private static final Set<String> VALID_DISTRICTS = Set.of(
            "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
            "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
            "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
            "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
            "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
    );

    /**
     * Lists packages for an agent with optional search and active-state filters.
     */
    @Transactional(readOnly = true)
    public List<PackageSummaryResponse> listPackages(Long agentId,
                                                     String search,
                                                     Boolean isActive) {
        List<Package> packages;

        if (search != null && !search.isBlank()) {
            // Prioritize text search when provided.
            packages = packageRepository.searchByAgentId(agentId, search);
        } else if (isActive != null) {
            // Filter by active state when explicitly requested.
            packages = packageRepository
                    .findByAgentIdAndIsActiveAndDeletedAtIsNullOrderByCreatedAtDesc(agentId, isActive);
        } else {
            // Default: all non-deleted packages for the agent.
            packages = packageRepository
                    .findByAgentIdAndDeletedAtIsNullOrderByCreatedAtDesc(agentId);
        }

        return packages.stream().map(this::toSummary).collect(Collectors.toList());
    }

    /**
     * Returns one package detail after ownership validation.
     */
    @Transactional(readOnly = true)
    public AgentPackageDetailResponse getPackage(Long agentId, String packageId) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        return toDetail(pkg);
    }

    /**
     * Creates a new package, uploads images, and builds itinerary rows.
     */
    @Transactional
    public AgentPackageDetailResponse createPackage(Long agentId,
                                                    String dataJson,
                                                    List<MultipartFile> imageFiles) {
        CreatePackageRequest req = parseRequest(dataJson);
        validateRequest(req);

        String pkgType = req.getPackageType() != null ? req.getPackageType() : "SINGLE_DISTRICT";

        Package pkg = Package.builder()
                .packageId(generatePackageId())
                .agent(agentRef(agentId))
                .packageName(req.getName())
                .category(req.getCategory().toUpperCase())

                .district(req.getDistrict())
                .startPlace(req.getStartPlace())
                .endPlace(req.getEndPlace())
                .duration(req.getDuration())
                .packageType(pkgType)
                .basePriceAdult(req.getBasePriceAdult())
                .basePriceChild(req.getBasePriceChild())

                .description(req.getDescription())
                .inclusions(req.getInclusions() != null ? String.join(",", req.getInclusions()) : "")

                .isActive(req.getIsActive() != null ? req.getIsActive() : true)

                .applicationStatus("Pending")
                .itinerary(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        if (imageFiles != null && !imageFiles.isEmpty()) {
            int order = 0;
            for (MultipartFile file : imageFiles) {

                String url = imageUploadService.uploadRoomImage(file).getImageUrl();
                PackageImage image = PackageImage.builder()
                        .pkg(pkg)
                        .imageUrl(url)
                        .displayOrder(order++)
                        .originalFileName(file.getOriginalFilename())
                        .build();
                pkg.getImages().add(image);
                if (order == 1) pkg.setImageUrl(url);
            }
        }

        // Build itinerary day entities from request payload.
        if (req.getDays() != null) {
            buildItinerary(pkg, req.getDays());
        }

        return toDetail(packageRepository.save(pkg));
    }

    /**
     * Updates package metadata, images, and itinerary for an owned package.
     */
    @Transactional
    public AgentPackageDetailResponse updatePackage(Long agentId,
                                                    String packageId,
                                                    String dataJson,
                                                    List<MultipartFile> imageFiles) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        CreatePackageRequest req = parseRequest(dataJson);
        validateRequest(req);

        // Update top-level package fields.
        pkg.setPackageName(req.getName());
        pkg.setCategory(req.getCategory().toUpperCase());

        pkg.setDistrict(req.getDistrict());
        pkg.setStartPlace(req.getStartPlace());
        pkg.setEndPlace(req.getEndPlace());
        pkg.setDuration(req.getDuration());
        pkg.setPackageType(req.getPackageType() != null ? req.getPackageType() : "SINGLE_DISTRICT");
        pkg.setBasePriceAdult(req.getBasePriceAdult());
        pkg.setBasePriceChild(req.getBasePriceChild());

        pkg.setDescription(req.getDescription());
        if (req.getInclusions() != null) {
            pkg.setInclusions(String.join(",", req.getInclusions()));
        }


        if (req.getIsActive() != null) pkg.setIsActive(req.getIsActive());


        // Keep only images explicitly retained by client.
        List<String> keepUrls = req.getExistingImageUrls() != null
                ? req.getExistingImageUrls() : List.of();
        pkg.getImages().removeIf(img -> !keepUrls.contains(img.getImageUrl()));

        int order = pkg.getImages().stream()
                .mapToInt(PackageImage::getDisplayOrder)
                .max().orElse(-1) + 1;

        // Append newly uploaded images after current max display order.
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {

                String url = imageUploadService.uploadRoomImage(file).getImageUrl();

                pkg.getImages().add(PackageImage.builder()
                        .pkg(pkg)
                        .imageUrl(url)
                        .displayOrder(order++)
                        .originalFileName(file.getOriginalFilename())
                        .build());
            }
        }

        // Update cover image from displayOrder 0 image if present.
        pkg.getImages().stream()
                .filter(img -> img.getDisplayOrder() == 0)
                .findFirst()
                .ifPresent(img -> pkg.setImageUrl(img.getImageUrl()));

        // Replace itinerary with incoming day list.
        pkg.getItinerary().clear();
        if (req.getDays() != null) buildItinerary(pkg, req.getDays());

        return toDetail(packageRepository.save(pkg));
    }

    /**
     * Toggles active status for an owned package.
     */
    @Transactional
    public PackageSummaryResponse updateStatus(Long agentId,
                                               String packageId,
                                               UpdatePackageStatusRequest req) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        pkg.setIsActive(req.getIsActive());
        packageRepository.save(pkg);
        return PackageSummaryResponse.builder()
                .packageId(pkg.getPackageId())
                .isActive(pkg.getIsActive())
                .build();
    }

    /**
     * Soft-deletes an owned package by setting deletedAt and deactivating it.
     */
    @Transactional
    public void deletePackage(Long agentId, String packageId) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        pkg.setDeletedAt(LocalDateTime.now());
        pkg.setIsActive(false);
        packageRepository.save(pkg);
    }

    private void buildItinerary(Package pkg, List<PackageDayRequest> days) {
        for (PackageDayRequest dayReq : days) {
            String activitiesText = "";
            if (dayReq.getActivities() != null && !dayReq.getActivities().isEmpty()) {
                try {
                    activitiesText = objectMapper.writeValueAsString(dayReq.getActivities());
                } catch (Exception e) {
                    activitiesText = "[]";
                }
            }

            // Resolve hotel reference for multi-district packages
            Hotel hotelRef = null;
            if (dayReq.getHotelId() != null) {
                hotelRef = hotelRepository.findById(dayReq.getHotelId()).orElse(null);
            }

            PackageItinerary day = PackageItinerary.builder()
                    .pkg(pkg)
                    .dayNumber(dayReq.getDayNumber())
                    .title(dayReq.getTitle())
                    .description(dayReq.getDescription())
                    .activities(activitiesText)
                    .district(dayReq.getDistrict())
                    .hotel(hotelRef)
                    .hotelNameCustom(dayReq.getHotelNameCustom())
                    .build();
            pkg.getItinerary().add(day);
        }
    }

    /**
     * Resolves package by public id and enforces agent ownership.
     */
    private Package findAndValidateOwnership(Long agentId, String packageId) {
        Package pkg = packageRepository.findByPackageIdAndDeletedAtIsNull(packageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Package not found: " + packageId));
        if (!pkg.getAgent().getId().equals(agentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not own this package");
        }
        return pkg;
    }

    /**
     * Validates request domain rules: district, category, pricing, and day ordering.
     */
    private void validateRequest(CreatePackageRequest req) {
        if (!VALID_DISTRICTS.contains(req.getDistrict())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid district: " + req.getDistrict());
        }
        try {
            Package.PackageCategory.valueOf(req.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid category: " + req.getCategory());
        }

        // Validate per-person pricing
        if (req.getBasePriceAdult() != null && req.getBasePriceAdult() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Base price per adult must be >= 0");
        }
        if (req.getBasePriceChild() != null && req.getBasePriceChild() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Base price per child must be >= 0");
        }
        if (req.getDays() != null && !req.getDays().isEmpty()) {
            for (int i = 0; i < req.getDays().size(); i++) {
                if (!req.getDays().get(i).getDayNumber().equals(i + 1)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Day numbers must be sequential starting at 1");
                }
            }
            // For multi-district: validate that each day has a district
            if ("MULTI_DISTRICT".equals(req.getPackageType())) {
                for (PackageDayRequest day : req.getDays()) {
                    if (day.getDistrict() == null || day.getDistrict().isBlank()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Each day must have a district for multi-district packages");
                    }
                }
            }
        }
    }

    /**
     * Generates the next public package id.
     */
    private String generatePackageId() {
        return "PKG-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Creates a lightweight agent reference for package assignment.
     */
    private Agent agentRef(Long agentId) {
        Agent agent = new Agent();
        agent.setId(agentId);
        return agent;
    }

    /**
     * Parses JSON payload into CreatePackageRequest.
     */
    private CreatePackageRequest parseRequest(String dataJson) {
        try {
            return objectMapper.readValue(dataJson, CreatePackageRequest.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid request data: " + e.getMessage());
        }
    }

    /**
     * Maps Package entity -> list summary response DTO.
     */
    private PackageSummaryResponse toSummary(Package pkg) {
        String coverUrl = pkg.getImages() != null && !pkg.getImages().isEmpty()
                ? pkg.getImages().get(0).getImageUrl()
                : pkg.getImageUrl();

        return PackageSummaryResponse.builder()
                .packageId(pkg.getPackageId())
                .name(pkg.getPackageName())
                .category(pkg.getCategory())

                .district(pkg.getDistrict())
                .duration(pkg.getDuration())

                .basePriceAdult(pkg.getBasePriceAdult())
                .basePriceChild(pkg.getBasePriceChild())
                .isActive(pkg.getIsActive())
                .applicationStatus(pkg.getApplicationStatus())

                .coverImageUrl(coverUrl)
                .createdAt(pkg.getCreatedAt())
                .build();
    }

    /**
     * Maps Package entity -> detailed response DTO including images and day plans.
     */
    private AgentPackageDetailResponse toDetail(Package pkg) {
        List<AgentPackageDetailResponse.AgentPackageImageResponse> images = new ArrayList<>();
        if (pkg.getImages() != null) {
            images = pkg.getImages().stream()
                    .map(img -> AgentPackageDetailResponse.AgentPackageImageResponse.builder()
                            .imageUrl(img.getImageUrl())
                            .displayOrder(img.getDisplayOrder())
                            .originalFileName(img.getOriginalFileName())
                            .build())
                    .collect(Collectors.toList());
        }

        List<AgentPackageDetailResponse.AgentPackageDayResponse> days = new ArrayList<>();
        if (pkg.getItinerary() != null) {
            days = pkg.getItinerary().stream()
                    .map(day -> {
                        List<AgentPackageDetailResponse.PackageActivityResponse> activityList = new ArrayList<>();
                        if (day.getActivities() != null && !day.getActivities().isBlank()) {
                            String raw = day.getActivities().trim();
                            if (raw.startsWith("[")) {
                                try {
                                    // It's a JSON array of objects or strings
                                    com.fasterxml.jackson.databind.JsonNode arrayNode = objectMapper.readTree(raw);
                                    for (com.fasterxml.jackson.databind.JsonNode node : arrayNode) {
                                        if (node.isObject()) {
                                            activityList.add(AgentPackageDetailResponse.PackageActivityResponse.builder()
                                                    .description(node.has("description") ? node.get("description").asText() : "")
                                                    .imageUrl(node.has("imageUrl") && !node.get("imageUrl").isNull() ? node.get("imageUrl").asText() : null)
                                                    .build());
                                        } else if (node.isTextual()) {
                                            activityList.add(AgentPackageDetailResponse.PackageActivityResponse.builder()
                                                    .description(node.asText())
                                                    .build());
                                        }
                                    }
                                } catch (Exception e) {
                                    // fallback if parsing fails
                                }
                            } else {
                                // Fallback: Old comma-separated string
                                for (String a : raw.split(",")) {
                                    if (!a.trim().isEmpty()) {
                                        activityList.add(AgentPackageDetailResponse.PackageActivityResponse.builder()
                                                .description(a.trim())
                                                .build());
                                    }
                                }
                            }
                        }
                        // Resolve hotel name for display
                        String hotelName = null;
                        String hotelImageUrl = null;
                        Long hotelId = null;
                        if (day.getHotel() != null) {
                            hotelId = day.getHotel().getId();
                            hotelName = day.getHotel().getHotelName();
                            hotelImageUrl = day.getHotel().getImageUrl();
                        } else if (day.getHotelNameCustom() != null) {
                            hotelName = day.getHotelNameCustom();
                        }

                        return AgentPackageDetailResponse.AgentPackageDayResponse.builder()
                                .dayId(day.getId())
                                .dayNumber(day.getDayNumber())
                                .title(day.getTitle())
                                .description(day.getDescription())
                                .activities(activityList)
                                .district(day.getDistrict())
                                .hotelId(hotelId)
                                .hotelName(hotelName)
                                .hotelImageUrl(hotelImageUrl)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return AgentPackageDetailResponse.builder()
                .packageId(pkg.getPackageId())
                .name(pkg.getPackageName())
                .category(pkg.getCategory())

                .district(pkg.getDistrict())
                .startPlace(pkg.getStartPlace())
                .endPlace(pkg.getEndPlace())
                .duration(pkg.getDuration())
                .packageType(pkg.getPackageType())
                .basePriceAdult(pkg.getBasePriceAdult())
                .basePriceChild(pkg.getBasePriceChild())

                .description(pkg.getDescription())
                .inclusions(pkg.getInclusions() != null && !pkg.getInclusions().isEmpty() ? java.util.Arrays.asList(pkg.getInclusions().split(",")) : new ArrayList<>())
                .isActive(pkg.getIsActive())
                .applicationStatus(pkg.getApplicationStatus())


                .images(images)
                .days(days)
                .createdAt(pkg.getCreatedAt())
                .updatedAt(pkg.getUpdatedAt())
                .build();
    }
}