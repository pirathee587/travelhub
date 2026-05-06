package com.travelhub.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelhub.backend.dto.request.CreatePackageRequest;
import com.travelhub.backend.dto.request.PackageDayRequest;
import com.travelhub.backend.dto.request.UpdatePackageStatusRequest;
import com.travelhub.backend.dto.response.AgentPackageDetailResponse;
import com.travelhub.backend.dto.response.PackageSummaryResponse;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
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
    private final ImageUploadService imageUploadService;
    private final ObjectMapper objectMapper;

    private static final Set<String> VALID_DISTRICTS = Set.of(
            "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
            "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
            "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
            "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
            "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
    );

    // ── LIST ─────────────────────────────────────────────────────────────────
    public List<PackageSummaryResponse> listPackages(Long agentId,
                                                     String search,
                                                     Boolean isActive) {
        List<Package> packages;

        if (search != null && !search.isBlank()) {
            packages = packageRepository.searchByAgentId(agentId, search);
        } else if (isActive != null) {
            packages = packageRepository
                    .findByAgentIdAndIsActiveAndDeletedAtIsNullOrderByCreatedAtDesc(agentId, isActive);
        } else {
            packages = packageRepository
                    .findByAgentIdAndDeletedAtIsNullOrderByCreatedAtDesc(agentId);
        }

        return packages.stream().map(this::toSummary).collect(Collectors.toList());
    }

    // ── GET ONE ──────────────────────────────────────────────────────────────
    public AgentPackageDetailResponse getPackage(Long agentId, String packageId) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        return toDetail(pkg);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    @Transactional
    public AgentPackageDetailResponse createPackage(Long agentId,
                                                    String dataJson,
                                                    List<MultipartFile> imageFiles) {
        CreatePackageRequest req = parseRequest(dataJson);
        validateRequest(req);

        Package pkg = Package.builder()
                .packageId(generatePackageId())
                .agent(agentRef(agentId))
                .packageName(req.getName())
                .category(req.getCategory().toUpperCase())
                .destination(req.getDestination())
                .district(req.getDistrict())
                .startPlace(req.getStartPlace())
                .endPlace(req.getEndPlace())
                .duration(req.getDuration())
                .priceFrom(req.getPriceFrom())
                .priceTo(req.getPriceTo())
                .description(req.getDescription())
                .festivalDetails(req.getFestivalDetails())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .trending(req.getTrending() != null ? req.getTrending() : false)
                .applicationStatus("Pending")
                .itinerary(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        // Upload images to Supabase
        if (imageFiles != null && !imageFiles.isEmpty()) {
            int order = 0;
            for (MultipartFile file : imageFiles) {
                String url = imageUploadService.uploadRoomImage(file, "packages").getImageUrl();
                PackageImage image = PackageImage.builder()
                        .pkg(pkg)
                        .imageUrl(url)
                        .displayOrder(order++)
                        .originalFileName(file.getOriginalFilename())
                        .build();
                pkg.getImages().add(image);
                if (order == 1) pkg.setImageUrl(url); // set cover
            }
        }

        // Build itinerary
        if (req.getDays() != null) {
            buildItinerary(pkg, req.getDays());
        }

        return toDetail(packageRepository.save(pkg));
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    @Transactional
    public AgentPackageDetailResponse updatePackage(Long agentId,
                                                    String packageId,
                                                    String dataJson,
                                                    List<MultipartFile> imageFiles) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        CreatePackageRequest req = parseRequest(dataJson);
        validateRequest(req);

        pkg.setPackageName(req.getName());
        pkg.setCategory(req.getCategory().toUpperCase());
        pkg.setDestination(req.getDestination());
        pkg.setDistrict(req.getDistrict());
        pkg.setStartPlace(req.getStartPlace());
        pkg.setEndPlace(req.getEndPlace());
        pkg.setDuration(req.getDuration());
        pkg.setPriceFrom(req.getPriceFrom());
        pkg.setPriceTo(req.getPriceTo());
        pkg.setDescription(req.getDescription());
        pkg.setFestivalDetails(req.getFestivalDetails());
        if (req.getIsActive() != null) pkg.setIsActive(req.getIsActive());
        if (req.getTrending() != null) pkg.setTrending(req.getTrending());

        // Handle images
        List<String> keepUrls = req.getExistingImageUrls() != null
                ? req.getExistingImageUrls() : List.of();
        pkg.getImages().removeIf(img -> !keepUrls.contains(img.getImageUrl()));

        int order = pkg.getImages().stream()
                .mapToInt(PackageImage::getDisplayOrder)
                .max().orElse(-1) + 1;

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                String url = imageUploadService.uploadRoomImage(file, "packages").getImageUrl();
                pkg.getImages().add(PackageImage.builder()
                        .pkg(pkg)
                        .imageUrl(url)
                        .displayOrder(order++)
                        .originalFileName(file.getOriginalFilename())
                        .build());
            }
        }

        // Update cover
        pkg.getImages().stream()
                .filter(img -> img.getDisplayOrder() == 0)
                .findFirst()
                .ifPresent(img -> pkg.setImageUrl(img.getImageUrl()));

        // Replace itinerary
        pkg.getItinerary().clear();
        if (req.getDays() != null) buildItinerary(pkg, req.getDays());

        return toDetail(packageRepository.save(pkg));
    }

    // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
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

    // ── SOFT DELETE ───────────────────────────────────────────────────────────
    @Transactional
    public void deletePackage(Long agentId, String packageId) {
        Package pkg = findAndValidateOwnership(agentId, packageId);
        pkg.setDeletedAt(LocalDateTime.now());
        pkg.setIsActive(false);
        packageRepository.save(pkg);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private void buildItinerary(Package pkg, List<PackageDayRequest> days) {
        for (PackageDayRequest dayReq : days) {
            String activitiesText = "";
            if (dayReq.getActivities() != null && !dayReq.getActivities().isEmpty()) {
                activitiesText = String.join(", ", dayReq.getActivities());
            }
            PackageItinerary day = PackageItinerary.builder()
                    .pkg(pkg)
                    .dayNumber(dayReq.getDayNumber())
                    .title(dayReq.getTitle())
                    .description(dayReq.getDescription())
                    .activities(activitiesText)
                    .build();
            pkg.getItinerary().add(day);
        }
    }

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
        if (req.getPriceTo().compareTo(req.getPriceFrom()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "priceTo must be >= priceFrom");
        }
        if (req.getDays() != null && !req.getDays().isEmpty()) {
            for (int i = 0; i < req.getDays().size(); i++) {
                if (!req.getDays().get(i).getDayNumber().equals(i + 1)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Day numbers must be sequential starting at 1");
                }
            }
        }
    }

    private String generatePackageId() {
        long count = packageRepository.countAll() + 1;
        return String.format("PKG%03d", count);
    }

    private Agent agentRef(Long agentId) {
        Agent agent = new Agent();
        agent.setId(agentId);
        return agent;
    }

    private CreatePackageRequest parseRequest(String dataJson) {
        try {
            return objectMapper.readValue(dataJson, CreatePackageRequest.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid request data: " + e.getMessage());
        }
    }

    // ── MAPPERS ───────────────────────────────────────────────────────────────

    private PackageSummaryResponse toSummary(Package pkg) {
        String coverUrl = pkg.getImages() != null && !pkg.getImages().isEmpty()
                ? pkg.getImages().get(0).getImageUrl()
                : pkg.getImageUrl();

        return PackageSummaryResponse.builder()
                .packageId(pkg.getPackageId())
                .name(pkg.getPackageName())
                .category(pkg.getCategory())
                .destination(pkg.getDestination())
                .district(pkg.getDistrict())
                .duration(pkg.getDuration())
                .priceFrom(pkg.getPriceFrom())
                .priceTo(pkg.getPriceTo())
                .isActive(pkg.getIsActive())
                .trending(pkg.getTrending())
                .coverImageUrl(coverUrl)
                .createdAt(pkg.getCreatedAt())
                .build();
    }

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
                        List<String> activityList = new ArrayList<>();
                        if (day.getActivities() != null && !day.getActivities().isBlank()) {
                            for (String a : day.getActivities().split(",")) {
                                activityList.add(a.trim());
                            }
                        }
                        return AgentPackageDetailResponse.AgentPackageDayResponse.builder()
                                .dayId(day.getId())
                                .dayNumber(day.getDayNumber())
                                .title(day.getTitle())
                                .description(day.getDescription())
                                .activities(activityList)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return AgentPackageDetailResponse.builder()
                .packageId(pkg.getPackageId())
                .name(pkg.getPackageName())
                .category(pkg.getCategory())
                .destination(pkg.getDestination())
                .district(pkg.getDistrict())
                .startPlace(pkg.getStartPlace())
                .endPlace(pkg.getEndPlace())
                .duration(pkg.getDuration())
                .priceFrom(pkg.getPriceFrom())
                .priceTo(pkg.getPriceTo())
                .description(pkg.getDescription())
                .festivalDetails(pkg.getFestivalDetails())
                .isActive(pkg.getIsActive())
                .trending(pkg.getTrending())
                .images(images)
                .days(days)
                .createdAt(pkg.getCreatedAt())
                .updatedAt(pkg.getUpdatedAt())
                .build();
    }
}