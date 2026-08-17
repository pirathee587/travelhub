package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminAgentDetailResponse;
import com.travelhub.backend.dto.response.AdminAgentListResponse;
import com.travelhub.backend.dto.response.AdminAgentPackageResponse;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAgentService {

    private final jakarta.persistence.EntityManager entityManager;
    private final AgentRepository         agentRepository;
    private final PackageRepository       packageRepository;
    private final AgentRatingCalculator   agentRatingCalculator;
    private final ReviewRepository        reviewRepository;
    private final NotificationRepository  notificationRepository;
    private final DriverRepository        driverRepository;
    private final VehicleRepository       vehicleRepository;
    private final VehicleOwnerRepository  vehicleOwnerRepository;
    private final AgentSettingsRepository agentSettingsRepository;
    private final RefundRequestRepository refundRequestRepository;
    private final PaymentRepository       paymentRepository;
    private final PackageReportRepository packageReportRepository;
    private final UserRepository          userRepository;

    // ── Get All Agents ────────────────────────────────
    public List<AdminAgentListResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Search Agents ─────────────────────────────────
    public List<AdminAgentListResponse> searchAgents(
            String keyword) {
        return agentRepository
                .findByAgencyNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Get Agent Detail ──────────────────────────────
    // View Button click → Full detail page
    public AdminAgentDetailResponse getAgentDetail(
            Long id) {

        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));


        String initials = generateInitials(
                agent.getAgencyName());

        // Member Since format
        // LocalDateTime → "March 2020"
        String memberSince = "";
        if (agent.getSubmittedDate() != null) {
            memberSince = agent.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern(
                            "MMMM yyyy",
                            Locale.ENGLISH));
        }


        String submittedDate = "";
        if (agent.getSubmittedDate() != null) {
            submittedDate = agent.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern(
                            "dd/MM/yyyy"));
        }

        Long dbTotalTrips = agentRepository.getTotalTripsByAgentId(id);
        Integer totalTripsVal = dbTotalTrips != null ? dbTotalTrips.intValue() : 0;

        return new AdminAgentDetailResponse(
                agent.getId(),
                agent.getOwner() != null ? agent.getOwner().getId() : null,
                initials,
                agent.getAgencyName(),
                agent.getAgencyName(),
                agent.getOwner() != null ? agent.getOwner().getProfileImage() : null,
                agent.getOwner() != null ? agent.getOwner().getName() : null,
                agent.getOwner() != null ? agent.getOwner().getEmail() : null,
                agent.getOwner() != null ? agent.getOwner().getTelephone() : null,
                agent.getLocation(),
                memberSince,
                agent.getOwner() != null && Boolean.TRUE.equals(agent.getOwner().getAgentApproved())
                        ? "Approved"
                        : "Pending",
                submittedDate,
                agent.getOwner() != null ? agent.getOwner().getNicNumber() : null,
                agent.getOwner() != null ? agent.getOwner().getNicImage() : null,
                resolveNicStatus(agent.getOwner()),
                agent.getOwner() != null ? agent.getOwner().getAdminMessage() : null,
                agentRatingCalculator.getAgentRating(id),
                totalTripsVal,
                agent.getExperienceYears(),
                agent.getIsActive()
        );
    }

    // ── Get Agent Packages ────────────────────────────

    public List<AdminAgentPackageResponse>
    getAgentPackages(Long agentId) {

        agentRepository.findById(agentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", agentId));

        List<Package> packages = packageRepository.findByAgent_Id(agentId);
        if (packages.isEmpty()) return List.of();

        List<Long> packageIds = packages.stream().map(Package::getId).toList();
        java.util.Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByPackageIds(packageIds);

        return packages.stream()
                .map(p -> mapToPackageResponse(p, avgRatings.get(p.getId())))
                .toList();
    }

    // ── Toggle Active ─────────────────────────────────
    @Transactional
    public AdminAgentDetailResponse toggleActive(
            Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));

        // If currently active and attempting to deactivate, check for active bookings
        if (Boolean.TRUE.equals(agent.getIsActive())) {
            Number activeBookingsCount = (Number) entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM bookings b " +
                    "JOIN packages p ON b.package_id = p.id " +
                    "WHERE p.agent_id = :id AND LOWER(b.status) NOT IN ('cancelled', 'rejected')"
            ).setParameter("id", id).getSingleResult();

            if (activeBookingsCount != null && activeBookingsCount.longValue() > 0) {
                throw new BadRequestException(
                        "Cannot deactivate agency: This agency currently has " + activeBookingsCount.longValue()
                        + " active booking(s). Agencies with active bookings cannot be deactivated."
                );
            }
        }

        agent.setIsActive(!agent.getIsActive());
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    // ── Delete Agent ──────────────────────────────────
    @Transactional
    @CacheEvict(value = {"touristPackages", "touristPackageDetails"}, allEntries = true)
    public void deleteAgent(Long id) {
        deleteAgent(id, null);
    }

    @Transactional
    @CacheEvict(value = {"touristPackages", "touristPackageDetails"}, allEntries = true)
    public void deleteAgent(Long id, String reason) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));

        // ── Check for existing / active bookings ────────────────────────
        Number activeBookingsCount = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM bookings b " +
                "JOIN packages p ON b.package_id = p.id " +
                "WHERE p.agent_id = :id AND LOWER(b.status) NOT IN ('cancelled', 'rejected')"
        ).setParameter("id", id).getSingleResult();

        if (activeBookingsCount != null && activeBookingsCount.longValue() > 0) {
            throw new BadRequestException(
                    "Cannot delete agency: This agency currently has " + activeBookingsCount.longValue()
                    + " active booking(s). Agencies with active bookings cannot be deleted."
            );
        }

        Long ownerId = agent.getOwner() != null ? agent.getOwner().getId() : null;

        // 1. Evidence of package reports
        entityManager.createNativeQuery(
                "DELETE FROM package_report_evidence WHERE report_id IN (" +
                "  SELECT id FROM package_reports WHERE agent_id = :id " +
                "  OR package_id IN (SELECT id FROM packages WHERE agent_id = :id)" +
                ")"
        ).setParameter("id", id).executeUpdate();

        // 2. Package reports
        entityManager.createNativeQuery(
                "DELETE FROM package_reports WHERE agent_id = :id " +
                "OR package_id IN (SELECT id FROM packages WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();

        // 3. Refund requests
        entityManager.createNativeQuery(
                "DELETE FROM refund_requests WHERE agent_id = :id " +
                "OR booking_id IN (SELECT id FROM bookings WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id))"
        ).setParameter("id", id).executeUpdate();

        // 4. Payments
        entityManager.createNativeQuery(
                "UPDATE payments SET agent_id = NULL WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM payments WHERE booking_id IN (" +
                "  SELECT id FROM bookings WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id)" +
                ")"
        ).setParameter("id", id).executeUpdate();

        // 5. Review images and reviews
        entityManager.createNativeQuery(
                "DELETE FROM review_images WHERE review_id IN (" +
                "  SELECT id FROM reviews WHERE agent_id = :id " +
                "  OR package_id IN (SELECT id FROM packages WHERE agent_id = :id)" +
                ")"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM reviews WHERE agent_id = :id " +
                "OR package_id IN (SELECT id FROM packages WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();

        // 6. Documents linked to bookings of this agent's packages
        entityManager.createNativeQuery(
                "DELETE FROM documents WHERE booking_id IN (" +
                "  SELECT id FROM bookings WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id)" +
                ")"
        ).setParameter("id", id).executeUpdate();

        // 7. Booking hotel preferences
        entityManager.createNativeQuery(
                "DELETE FROM booking_hotel_preferences WHERE booking_id IN (" +
                "  SELECT id FROM bookings WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id)" +
                ")"
        ).setParameter("id", id).executeUpdate();

        // 8. Bookings (unbind drivers/vehicles, then delete bookings of agent's packages)
        entityManager.createNativeQuery(
                "UPDATE bookings SET driver_id = NULL WHERE driver_id IN (SELECT id FROM drivers WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "UPDATE bookings SET vehicle_id = NULL WHERE vehicle_id IN (SELECT id FROM vehicles WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM bookings WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();

        // 9. Package itinerary & package images & packages
        entityManager.createNativeQuery(
                "DELETE FROM package_itinerary WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM package_images WHERE package_id IN (SELECT id FROM packages WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM packages WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();

        // 10. Drivers
        entityManager.createNativeQuery(
                "DELETE FROM drivers WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();

        // 11. Vehicles & Vehicle Owners
        entityManager.createNativeQuery(
                "UPDATE vehicles SET owner_id = NULL WHERE agent_id = :id " +
                "OR owner_id IN (SELECT id FROM vehicle_owners WHERE agent_id = :id)"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM vehicles WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery(
                "DELETE FROM vehicle_owners WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();

        // 12. Agent settings
        entityManager.createNativeQuery(
                "DELETE FROM agent_settings WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();

        // 13. Notifications
        entityManager.createNativeQuery(
                "DELETE FROM notifications WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();

        // 14. Unlink legacy agent_id in users
        entityManager.createNativeQuery(
                "UPDATE users SET agent_id = NULL WHERE agent_id = :id"
        ).setParameter("id", id).executeUpdate();

        // 15. Delete the agent record
        entityManager.createNativeQuery(
                "DELETE FROM agents WHERE id = :id"
        ).setParameter("id", id).executeUpdate();

        // 16. Update owner user status if present
        if (ownerId != null) {
            if (reason != null && !reason.isBlank()) {
                entityManager.createNativeQuery(
                        "UPDATE users SET agent_approved = false, agent_id = NULL, " +
                        "nic_verification_status = 'REJECTED', admin_message = :reason WHERE id = :ownerId"
                ).setParameter("reason", reason)
                 .setParameter("ownerId", ownerId)
                 .executeUpdate();
            } else {
                entityManager.createNativeQuery(
                        "UPDATE users SET agent_approved = false, agent_id = NULL, " +
                        "nic_verification_status = 'REJECTED' WHERE id = :ownerId"
                ).setParameter("ownerId", ownerId)
                 .executeUpdate();
            }
        }
    }

    // ── Generate Initials ─────────────────────────────
    // "Pinnacle Tours & Travels" → "PT"
    private String generateInitials(String name) {
        if (name == null || name.isBlank())
            return "?";
        String[] words = name.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String word : words) {
            if (!word.equals("&")
                    && !word.equals("and")
                    && !word.isEmpty()) {
                initials.append(
                        Character.toUpperCase(
                                word.charAt(0)));
                if (initials.length() == 2) break;
            }
        }
        return initials.toString();
    }

    // ── Resolve NIC Status ────────────────────────────
    private String resolveNicStatus(com.travelhub.backend.entity.User owner) {
        if (owner == null) return "PENDING";
        boolean hasNicDoc = owner.getNicImage() != null && !owner.getNicImage().isBlank();
        boolean hasNicNumber = owner.getNicNumber() != null && !owner.getNicNumber().isBlank() && !"—".equals(owner.getNicNumber().trim());
        String status = owner.getNicVerificationStatus();

        if ("SUSPENDED".equalsIgnoreCase(status)) return "SUSPENDED";
        if ("REJECTED".equalsIgnoreCase(status)) return "REJECTED";

        // ONLY verified if an actual NIC document image is uploaded AND approved
        if (hasNicDoc && ("APPROVED".equalsIgnoreCase(status) || Boolean.TRUE.equals(owner.getAgentApproved()))) {
            return "APPROVED";
        }
        if (hasNicDoc || hasNicNumber) {
            return "PROVIDED";
        }
        return "PENDING";
    }

    // ── Map Agent → List Response ─────────────────────
    private AdminAgentListResponse mapToListResponse(
            Agent a) {

        String submittedDate = "";
        if (a.getSubmittedDate() != null) {
            submittedDate = a.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern(
                            "dd/MM/yyyy"));
        }

        int pkgCount = 0;
        try {
            pkgCount = packageRepository.findByAgent_Id(a.getId()).size();
        } catch (Exception ignored) {}

        Double computedRating = agentRatingCalculator.getAgentRating(a.getId());
        Long dbTotalTrips = agentRepository.getTotalTripsByAgentId(a.getId());
        Integer totalTripsVal = dbTotalTrips != null ? dbTotalTrips.intValue() : 0;

        return new AdminAgentListResponse(
                a.getId(),
                a.getOwner() != null ? a.getOwner().getId() : null,
                a.getAgencyName(),
                a.getAgencyName(),
                a.getOwner() != null ? a.getOwner().getName() : null,
                a.getOwner() != null ? a.getOwner().getEmail() : null,
                a.getOwner() != null ? a.getOwner().getTelephone() : null,
                a.getLocation(),
                a.getOwner() != null ? a.getOwner().getProfileImage() : null,
                a.getBio(),
                computedRating != null ? computedRating : (a.getRating() != null ? a.getRating() : 0.0),
                totalTripsVal,
                pkgCount,
                a.getExperienceYears() != null ? a.getExperienceYears() : 0,
                a.getOwner() != null ? a.getOwner().getNicNumber() : null,
                a.getOwner() != null && Boolean.TRUE.equals(a.getOwner().getAgentApproved())
                        ? "Approved"
                        : "Pending",
                resolveNicStatus(a.getOwner()),
                submittedDate,
                a.getIsActive() != null ? a.getIsActive() : true
        );
    }

    // ── Map Package → Response ────────────────────────
    private AdminAgentPackageResponse mapToPackageResponse(
            Package p, Double computedRating) {
        // Resolve cover image: use imageUrl first, then fall back to first PackageImage
        String imgUrl = p.getImageUrl();
        if ((imgUrl == null || imgUrl.isEmpty())
                && p.getImages() != null
                && !p.getImages().isEmpty()) {
            imgUrl = p.getImages().stream()
                    .sorted((a, b) ->
                            (a.getDisplayOrder() != null ? a.getDisplayOrder() : 0)
                          - (b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .findFirst()
                    .map(img -> img.getImageUrl())
                    .orElse(null);
        }

        Double priceFrom = p.getPriceFrom() != null && p.getPriceFrom() > 0
                ? p.getPriceFrom()
                : (p.getBasePriceAdult() != null ? p.getBasePriceAdult() : 0.0);

        Double rating = computedRating != null && computedRating > 0
                ? Math.round(computedRating * 10.0) / 10.0
                : (p.getRating() != null ? p.getRating() : 0.0);

        return new AdminAgentPackageResponse(
                p.getId(),
                p.getPackageName(),
                p.getDestination(),
                priceFrom,
                p.getPriceTo(),
                p.getDuration(),
                p.getCategory(),
                rating,
                p.getTrending(),
                p.getIsActive(),
                p.getApplicationStatus() != null
                        ? p.getApplicationStatus()
                        : "Pending",
                imgUrl
        );
    }
}
