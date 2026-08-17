package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AdminNotificationPreferenceDto;
import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AdminNotificationStateRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageReportRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.PaymentRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.AdminNotificationPreferenceService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminNotificationController {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PackageRepository packageRepository;
    private final PaymentRepository paymentRepository;
    private final PackageReportRepository packageReportRepository;
    private final AdminNotificationPreferenceService preferenceService;
    private final AdminNotificationStateRepository notifStateRepository;

    private Long resolveCurrentAdminId() {
        // 1. Primary: JWT claims (fastest path)
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims != null && claims.get("userId") != null) {
            try {
                return Long.valueOf(claims.get("userId").toString());
            } catch (Exception ignored) {}
        }
        // 2. Secondary: look up by email from SecurityContext (targeted query)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByEmail(auth.getName())
                    .map(User::getId)
                    .orElse(null);
        }
        // 3. Safe fallback for single-admin systems: targeted role query (NOT findAll)
        //    Returns the first (and typically only) admin user's ID
        return userRepository.findByRole(Role.ADMIN).stream()
                .map(User::getId)
                .findFirst()
                .orElse(null);
    }

    // ── Preference Endpoints ────────────────────────────────────

    @GetMapping("/preferences")
    public ResponseEntity<AdminNotificationPreferenceDto> getPreferences() {
        Long adminId = resolveCurrentAdminId();
        return ResponseEntity.ok(preferenceService.getPreferences(adminId));
    }

    @PutMapping("/preferences")
    @Transactional
    public ResponseEntity<AdminNotificationPreferenceDto> updatePreferences(@RequestBody AdminNotificationPreferenceDto dto) {
        Long adminId = resolveCurrentAdminId();
        if (adminId == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(preferenceService.updatePreferences(adminId, dto));
    }

    // ── Notification Queries ────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<UserNotificationResponse>> getAllNotifications() {
        return ResponseEntity.ok(generateNotifications());
    }

    @GetMapping("/unread")
    public ResponseEntity<List<UserNotificationResponse>> getUnreadNotifications() {
        return ResponseEntity.ok(generateNotifications().stream()
                .filter(n -> !Boolean.TRUE.equals(n.getRead()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = generateNotifications().stream()
                .filter(n -> !Boolean.TRUE.equals(n.getRead()))
                .count();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<UserNotificationResponse>> getLatestNotifications() {
        List<UserNotificationResponse> list = generateNotifications();
        if (list.size() > 10) list = list.subList(0, 10);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/type")
    public ResponseEntity<List<UserNotificationResponse>> getNotificationsByType(@RequestParam String type) {
        return ResponseEntity.ok(generateNotifications().stream()
                .filter(n -> type.equalsIgnoreCase(n.getType()))
                .toList());
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Long adminId = resolveCurrentAdminId();
        if (adminId != null
                && !notifStateRepository.existsByAdminIdAndNotifIdAndState(adminId, id, "READ")) {
            notifStateRepository.save(AdminNotificationState.builder()
                    .adminId(adminId).notifId(id).state("READ").build());
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> markAllAsRead() {
        Long adminId = resolveCurrentAdminId();
        if (adminId == null) return ResponseEntity.ok().build();
        generateNotifications().forEach(n -> {
            Long nid = n.getId();
            if (!notifStateRepository.existsByAdminIdAndNotifIdAndState(adminId, nid, "READ")) {
                notifStateRepository.save(AdminNotificationState.builder()
                        .adminId(adminId).notifId(nid).state("READ").build());
            }
        });
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        Long adminId = resolveCurrentAdminId();
        if (adminId != null
                && !notifStateRepository.existsByAdminIdAndNotifIdAndState(adminId, id, "DELETED")) {
            notifStateRepository.save(AdminNotificationState.builder()
                    .adminId(adminId).notifId(id).state("DELETED").build());
        }
        return ResponseEntity.noContent().build();
    }

    // ── Notification Generation ───────────────────────────────────────────

    private List<UserNotificationResponse> generateNotifications() {
        List<UserNotificationResponse> notifications = new ArrayList<>();
        Long adminId = resolveCurrentAdminId();

        Set<Long> readIds    = adminId != null
                ? notifStateRepository.findNotifIdsByAdminIdAndState(adminId, "READ")
                : Collections.emptySet();
        Set<Long> deletedIds = adminId != null
                ? notifStateRepository.findNotifIdsByAdminIdAndState(adminId, "DELETED")
                : Collections.emptySet();

        AdminNotificationPreference pref = preferenceService.getPreferencesEntity(adminId);
        boolean agentPref  = pref.getNotifyAgentRegistrations()  != null ? pref.getNotifyAgentRegistrations()  : true;
        boolean hotelPref  = pref.getNotifyHotelRegistrations()  != null ? pref.getNotifyHotelRegistrations()  : true;
        boolean pkgPref    = pref.getNotifyPackageApprovals()    != null ? pref.getNotifyPackageApprovals()    : true;
        boolean payPref    = pref.getNotifyPaymentReceived()     != null ? pref.getNotifyPaymentReceived()     : true;
        boolean reportPref = pref.getNotifyTouristReports()      != null ? pref.getNotifyTouristReports()     : true;
        boolean sysPref    = pref.getNotifySystemAlerts()        != null ? pref.getNotifySystemAlerts()       : true;

        if (agentPref) {
            List<User> pendingAgentUsers = userRepository.findByRole(Role.AGENT).stream()
                    .filter(u -> !Boolean.TRUE.equals(u.getAgentApproved())
                            && !"APPROVED".equalsIgnoreCase(u.getNicVerificationStatus())
                            && !"REJECTED".equalsIgnoreCase(u.getNicVerificationStatus())
                            && !"SUSPENDED".equalsIgnoreCase(u.getNicVerificationStatus())
                            && !Boolean.FALSE.equals(u.getIsActive()))
                    .toList();
            for (User agent : pendingAgentUsers) {
                long nid = agent.getId() + 1_000_000L;
                if (!deletedIds.contains(nid)) {
                    notifications.add(build(nid, "agent_registration", "New Agent Approval",
                            agent.getName() + " has registered and is pending approval.",
                            "/admin/agents", "Just now", readIds.contains(nid)));
                }
            }
        }

        if (hotelPref) {
            for (Hotel hotel : hotelRepository.findByApplicationStatus("Pending")) {
                long nid = hotel.getId() + 2_000_000L;
                if (!deletedIds.contains(nid)) {
                    notifications.add(build(nid, "hotel_registration", "New Hotel Approval",
                            hotel.getHotelName() + " is pending approval.",
                            "/admin/hotels", "Just now", readIds.contains(nid)));
                }
            }
        }

        if (pkgPref) {
            for (Package pkg : packageRepository.findByApplicationStatus("Pending")) {
                long nid = pkg.getId() + 3_000_000L;
                if (!deletedIds.contains(nid)) {
                    notifications.add(build(nid, "package_registration", "New Package Approval",
                            pkg.getPackageName() + " is pending approval.",
                            "/admin/packages", "Just now", readIds.contains(nid)));
                }
            }
        }

        if (payPref) {
            for (Payment payment : paymentRepository.findTop10ByStatusOrderByCreatedAtDesc("Completed")) {
                long nid = payment.getId() + 4_000_000L;
                if (!deletedIds.contains(nid)) {
                    String payerName = payment.getUser() != null && payment.getUser().getName() != null
                            ? payment.getUser().getName()
                            : "Customer";
                    notifications.add(build(nid, "payment", "Payment Confirmed",
                            "$" + payment.getAmount() + " received from " + payerName
                                    + " (Txn: " + payment.getTransactionId() + ").",
                            "/admin/payments", formatRelativeTime(payment.getCreatedAt()), readIds.contains(nid)));
                }
            }
        }

        if (reportPref) {
            for (PackageReport report : packageReportRepository
                    .findTop10ByStatusInOrderByCreatedAtDesc(List.of("OPEN", "UNDER_REVIEW", "open", "under_review"))) {
                long nid = report.getId() + 5_000_000L;
                if (!deletedIds.contains(nid)) {
                    String tourist   = report.getUser() != null && report.getUser().getName() != null
                            ? report.getUser().getName()
                            : "Tourist";
                    String rptTitle  = report.getTitle() != null && !report.getTitle().isBlank()
                            ? report.getTitle()
                            : "Issue reported";
                    notifications.add(build(nid, "report", "New Tourist Report",
                            tourist + " submitted a report: " + rptTitle,
                            "/admin/reports", formatRelativeTime(report.getCreatedAt()), readIds.contains(nid)));
                }
            }
        }

        if (sysPref) {
            long nid = 6_000_001L;
            if (!deletedIds.contains(nid)) {
                notifications.add(build(nid, "system", "System Status Optimal",
                        "All platform services and database connections are operational.",
                        "/admin/dashboard", "Today", readIds.contains(nid)));
            }
        }

        return notifications;
    }

    private UserNotificationResponse build(long id, String type, String title,
                                           String message, String actionUrl,
                                           String time, boolean read) {
        UserNotificationResponse n = new UserNotificationResponse();
        n.setId(id);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setActionUrl(actionUrl);
        n.setTime(time);
        n.setRead(read);
        return n;
    }

    private String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        if (duration.isNegative() || duration.toMinutes() < 1) return "Just now";
        if (duration.toMinutes() < 60) return duration.toMinutes() + " min ago";
        if (duration.toHours() < 24) return duration.toHours() + " hours ago";
        return duration.toDays() + " days ago";
    }
}
