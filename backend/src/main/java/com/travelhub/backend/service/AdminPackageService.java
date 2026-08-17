package com.travelhub.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminPackageDetailResponse;
import com.travelhub.backend.dto.response.AdminPackageResponse;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.PackageImage;
import com.travelhub.backend.entity.PackageItinerary;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPackageService {

    private final PackageRepository packageRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;

    public long countActiveBookings(Long packageId) {
        try {
            Long count = bookingRepository.countByPkg_Id(packageId);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    // ── Get All Packages ──────────────────────────────
    public List<AdminPackageResponse> getAllPackages() {
        return packageRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Packages By Status ────────────────────────
    public List<AdminPackageResponse> getByStatus(String status) {
        return packageRepository
                .findByApplicationStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Package Detail ────────────────────────────
    public AdminPackageDetailResponse getPackageDetail(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));

        List<String> imageUrls = new ArrayList<>();
        if (pkg.getImages() != null && !pkg.getImages().isEmpty()) {
            imageUrls = pkg.getImages().stream()
                    .sorted((a, b) -> (a.getDisplayOrder() != null ? a.getDisplayOrder() : 0)
                            - (b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .map(PackageImage::getImageUrl)
                    .toList();
        } else if (pkg.getImageUrl() != null && !pkg.getImageUrl().isEmpty()) {
            imageUrls = List.of(pkg.getImageUrl());
        }

        List<String> inclusions = List.of();
        if (pkg.getInclusions() != null && !pkg.getInclusions().isEmpty()) {
            inclusions = Arrays.stream(pkg.getInclusions().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        List<AdminPackageDetailResponse.ItineraryDayDetail> itinerary = new ArrayList<>();
        if (pkg.getItinerary() != null) {
            itinerary = pkg.getItinerary().stream()
                    .sorted((a, b) -> (a.getDayNumber() != null ? a.getDayNumber() : 0)
                            - (b.getDayNumber() != null ? b.getDayNumber() : 0))
                    .map(this::mapToItineraryDetail)
                    .toList();
        }

        String providerName = "";
        if (pkg.getAgent() != null) {
            providerName = pkg.getAgent().getAgencyName();
        }

        Long bookingsCount = 0L;
        try {
            bookingsCount = bookingRepository.countByPkg_Id(id);
            if (bookingsCount == null) bookingsCount = 0L;
        } catch (Exception ignored) {}

        return new AdminPackageDetailResponse(
                pkg.getId(),
                pkg.getPackageId(),
                pkg.getPackageName(),
                pkg.getDestination(),
                pkg.getDistrict(),
                pkg.getStartPlace(),
                pkg.getEndPlace(),
                pkg.getPackageType() != null ? pkg.getPackageType() : "SINGLE_DISTRICT",
                pkg.getPriceFrom(),
                pkg.getPriceTo(),
                pkg.getBasePriceAdult(),
                pkg.getBasePriceChild(),
                imageUrls,
                pkg.getImageUrl(),
                pkg.getDuration(),
                providerName,
                pkg.getApplicationStatus() != null ? pkg.getApplicationStatus() : "Pending",
                pkg.getRejectionReason(),
                pkg.getDescription(),
                pkg.getFestivalDetails(),
                inclusions,
                itinerary,
                pkg.getRating(),
                pkg.getReviewCount(),
                pkg.getCategory(),
                pkg.getTrending(),
                pkg.getIsActive(),
                bookingsCount
        );
    }

    // ── Approve Package ───────────────────────────────
    @Transactional
    @CacheEvict(value = {"touristPackages", "touristPackageDetails"}, allEntries = true)
    public AdminPackageDetailResponse approvePackage(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        pkg.setApplicationStatus("Approved");
        pkg.setIsActive(true);
        pkg.setRejectionReason(null);
        packageRepository.save(pkg);

        eventPublisher.publishEvent(new PackageEvent(this, pkg, "APPROVED"));

        return getPackageDetail(id);
    }

    // ── Reject Package ────────────────────────────────
    @Transactional
    @CacheEvict(value = {"touristPackages", "touristPackageDetails"}, allEntries = true)
    public AdminPackageDetailResponse rejectPackage(Long id, String reason) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        pkg.setApplicationStatus("Rejected");
        pkg.setIsActive(false);
        pkg.setRejectionReason(reason);
        packageRepository.save(pkg);

        eventPublisher.publishEvent(new PackageEvent(this, pkg, "REJECTED", reason));

        return getPackageDetail(id);
    }

    // ── Toggle Active ─────────────────────────────────
    @Transactional
    @CacheEvict(value = {"touristPackages", "touristPackageDetails"}, allEntries = true)
    public AdminPackageDetailResponse toggleActive(Long id, String reason) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        boolean currentlyActive = Boolean.TRUE.equals(pkg.getIsActive());
        boolean newActive = !currentlyActive;
        pkg.setIsActive(newActive);

        if (newActive) {
            pkg.setApplicationStatus("Approved");
            pkg.setRejectionReason(null);
            packageRepository.save(pkg);
            eventPublisher.publishEvent(new PackageEvent(this, pkg, "APPROVED"));
        } else {
            long activeBookings = countActiveBookings(id);
            if (activeBookings > 0) {
                throw new BadRequestException("Cannot suspend package: This package currently has " + activeBookings + " active booking(s).");
            }
            pkg.setApplicationStatus("Suspended");
            pkg.setRejectionReason(reason);
            packageRepository.save(pkg);
            eventPublisher.publishEvent(new PackageEvent(this, pkg, "SUSPENDED", reason));
        }

        return getPackageDetail(id);
    }

    // ── Delete Package ────────────────────────────────
    @Transactional
    @CacheEvict(value = {"touristPackages", "touristPackageDetails"}, allEntries = true)
    public void deletePackage(Long id, String reason) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));

        long activeBookings = countActiveBookings(id);
        if (activeBookings > 0) {
            throw new BadRequestException(
                    "Cannot delete package: This package currently has " + activeBookings
                    + " booking(s). Packages with existing bookings cannot be removed."
            );
        }

        String effectiveReason = (reason != null && !reason.trim().isEmpty()) ? reason : "Deleted by admin";
        eventPublisher.publishEvent(new PackageEvent(this, pkg, "DELETED", effectiveReason));

        packageRepository.deleteById(id);
    }

    // ── Map Itinerary ─────────────────────────────────
    private AdminPackageDetailResponse.ItineraryDayDetail mapToItineraryDetail(PackageItinerary day) {
        List<AdminPackageDetailResponse.ActivityDetail> activities = new ArrayList<>();
        if (day.getActivities() != null && !day.getActivities().isBlank()) {
            String raw = day.getActivities().trim();
            if (raw.startsWith("[")) {
                try {
                    JsonNode arrayNode = objectMapper.readTree(raw);
                    for (JsonNode node : arrayNode) {
                        if (node.isObject()) {
                            activities.add(new AdminPackageDetailResponse.ActivityDetail(
                                    node.has("description") ? node.get("description").asText() : "",
                                    node.has("imageUrl") && !node.get("imageUrl").isNull() ? node.get("imageUrl").asText() : null
                            ));
                        } else if (node.isTextual()) {
                            activities.add(new AdminPackageDetailResponse.ActivityDetail(
                                    node.asText(),
                                    null
                            ));
                        }
                    }
                } catch (Exception ignored) {
                    // Fallback to basic string parsing if JSON fails
                    for (String a : raw.split(",")) {
                        if (!a.trim().isEmpty()) {
                            activities.add(new AdminPackageDetailResponse.ActivityDetail(a.trim(), null));
                        }
                    }
                }
            } else {
                for (String a : raw.split(",")) {
                    if (!a.trim().isEmpty()) {
                        activities.add(new AdminPackageDetailResponse.ActivityDetail(a.trim(), null));
                    }
                }
            }
        }

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

        return new AdminPackageDetailResponse.ItineraryDayDetail(
                day.getId(),
                day.getDayNumber(),
                day.getTitle(),
                day.getDescription(),
                activities,
                day.getDistrict(),
                hotelId,
                hotelName,
                hotelImageUrl
        );
    }

    // ── Map Entity → List Response ────────────────────
    private AdminPackageResponse mapToResponse(Package p) {
        String imageUrl = p.getImageUrl();
        if ((imageUrl == null || imageUrl.isEmpty()) && p.getImages() != null && !p.getImages().isEmpty()) {
            imageUrl = p.getImages().stream()
                    .sorted((a, b) -> (a.getDisplayOrder() != null ? a.getDisplayOrder() : 0)
                            - (b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .findFirst()
                    .map(PackageImage::getImageUrl)
                    .orElse(null);
        }

        Long bookingsCount = 0L;
        try {
            bookingsCount = bookingRepository.countByPkg_Id(p.getId());
            if (bookingsCount == null) bookingsCount = 0L;
        } catch (Exception ignored) {}

        return new AdminPackageResponse(
                p.getId(),
                p.getPackageName(),
                p.getDestination(),
                p.getPriceFrom(),
                p.getPriceTo(),
                p.getBasePriceAdult(),
                p.getBasePriceChild(),
                p.getDuration(),
                p.getCategory(),
                p.getRating(),
                p.getReviewCount(),
                p.getTrending(),
                p.getIsActive(),
                p.getAgent() != null ? p.getAgent().getAgencyName() : "",
                p.getApplicationStatus() != null ? p.getApplicationStatus() : "Pending",
                p.getRejectionReason(),
                imageUrl,
                bookingsCount
        );
    }
}
