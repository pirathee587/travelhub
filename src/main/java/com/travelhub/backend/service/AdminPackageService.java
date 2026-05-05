package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminPackageDetailResponse;
import com.travelhub.backend.dto.response.AdminPackageResponse;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.PackageItinerary;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.repository.PackageRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class AdminPackageService {

    private final PackageRepository          packageRepository;
    private final ApplicationEventPublisher  eventPublisher;
    public AdminPackageService(PackageRepository          packageRepository, ApplicationEventPublisher  eventPublisher) {
        this.packageRepository = packageRepository;
        this.eventPublisher = eventPublisher;
    }
 // ← சேர்க்கணும்

    // ── Get All Packages ──────────────────────────────
    public List<AdminPackageResponse> getAllPackages() {
        return packageRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Packages By Status ────────────────────────
    public List<AdminPackageResponse> getByStatus(
            String status) {
        return packageRepository
                .findByApplicationStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Package Detail ────────────────────────────
    public AdminPackageDetailResponse getPackageDetail(
            Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));

        List<String> imageUrls = List.of();
        if (pkg.getImages() != null) {
            imageUrls = pkg.getImages().stream()
                    .sorted((a, b) ->
                            (a.getDisplayOrder() != null
                                    ? a.getDisplayOrder() : 0)
                                    - (b.getDisplayOrder() != null
                                    ? b.getDisplayOrder() : 0))
                    .map(img -> img.getImageUrl())
                    .toList();
        }

        List<String> inclusions = List.of();
        if (pkg.getInclusions() != null
                && !pkg.getInclusions().isEmpty()) {
            inclusions = Arrays.stream(
                            pkg.getInclusions().split(","))
                    .map(String::trim).toList();
        }

        List<AdminPackageDetailResponse
                .ItineraryDayDetail> itinerary = List.of();
        if (pkg.getItinerary() != null) {
            itinerary = pkg.getItinerary().stream()
                    .sorted((a, b) ->
                            (a.getDayNumber() != null
                                    ? a.getDayNumber() : 0)
                                    - (b.getDayNumber() != null
                                    ? b.getDayNumber() : 0))
                    .map(this::mapToItineraryDetail)
                    .toList();
        }

        String providerName = "";
        if (pkg.getAgent() != null) {
            providerName =
                    pkg.getAgent().getCompanyName() != null
                            ? pkg.getAgent().getCompanyName()
                            : pkg.getAgent().getUser().getName();
        }

        return new AdminPackageDetailResponse(
                pkg.getId(),
                pkg.getPackageName(),
                pkg.getDestination(),
                pkg.getDistrict(),
                pkg.getPriceFrom(),
                pkg.getPriceTo(),
                imageUrls,
                pkg.getImageUrl(),
                pkg.getDuration(),
                providerName,
                pkg.getApplicationStatus() != null
                        ? pkg.getApplicationStatus()
                        : "Pending",
                pkg.getFestivalDetails(),
                inclusions,
                itinerary,
                pkg.getRating(),
                pkg.getReviewCount(),
                pkg.getCategory(),
                pkg.getTrending(),
                pkg.getIsActive()
        );
    }

    // ── Approve Package ───────────────────────────────
    public AdminPackageDetailResponse approvePackage(
            Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));
        pkg.setApplicationStatus("Approved");
        packageRepository.save(pkg);


        eventPublisher.publishEvent(
                new PackageEvent(this, pkg, "APPROVED"));

        return getPackageDetail(id);
    }

    // ── Reject Package ────────────────────────────────
    public AdminPackageDetailResponse rejectPackage(
            Long id, String reason) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));
        pkg.setApplicationStatus("Rejected");
        packageRepository.save(pkg);


        eventPublisher.publishEvent(
                new PackageEvent(
                        this, pkg, "REJECTED", reason));

        return getPackageDetail(id);
    }

    // ── Toggle Active ─────────────────────────────────
    public AdminPackageDetailResponse toggleActive(
            Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));
        pkg.setIsActive(!pkg.getIsActive());
        packageRepository.save(pkg);
        return getPackageDetail(id);
    }

    // ── Delete Package ────────────────────────────────
    public void deletePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));


        eventPublisher.publishEvent(
                new PackageEvent(this, pkg, "DELETED"));

        packageRepository.deleteById(id);
    }

    // ── Map Itinerary ─────────────────────────────────
    private AdminPackageDetailResponse
            .ItineraryDayDetail mapToItineraryDetail(
            PackageItinerary day) {
        List<String> activities = List.of();
        if (day.getActivities() != null) {
            activities = Arrays.stream(
                            day.getActivities().split(","))
                    .map(String::trim).toList();
        }
        return new AdminPackageDetailResponse
                .ItineraryDayDetail(
                day.getDayNumber(),
                day.getTitle(),
                day.getDescription(),
                activities);
    }

    // ── Map Entity → List Response ────────────────────
    private AdminPackageResponse mapToResponse(Package p) {
        return new AdminPackageResponse(
                p.getId(),
                p.getPackageName(),
                p.getDestination(),
                p.getPriceFrom(),
                p.getPriceTo(),
                p.getDuration(),
                p.getCategory(),
                p.getRating(),
                p.getReviewCount(),
                p.getTrending(),
                p.getIsActive(),
                p.getAgent() != null
                        ? p.getAgent().getUser().getName()
                        : "",
                p.getApplicationStatus() != null
                        ? p.getApplicationStatus()
                        : "Pending"
        );
    }
}