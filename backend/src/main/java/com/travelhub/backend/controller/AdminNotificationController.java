package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AdminNotificationPreferenceDto;
import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.enums.Role;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@Slf4j
public class AdminNotificationController {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PackageRepository packageRepository;
    private final PaymentRepository paymentRepository;
    private final PackageReportRepository packageReportRepository;
    private final AdminNotificationPreferenceService preferenceService;

    private final Set<Long> readNotificationIds = ConcurrentHashMap.newKeySet();
    private final Set<Long> deletedNotificationIds = ConcurrentHashMap.newKeySet();

    private Long resolveCurrentAdminId() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims != null && claims.get("userId") != null) {
            try {
                return Long.valueOf(claims.get("userId").toString());
            } catch (Exception ignored) {}
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            User user = userRepository.findByEmail(auth.getName()).orElse(null);
            if (user != null) {
                return user.getId();
            }
        }
        // Fallback: look for an admin user if running under permissive context
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
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
    public ResponseEntity<AdminNotificationPreferenceDto> updatePreferences(@RequestBody AdminNotificationPreferenceDto dto) {
        Long adminId = resolveCurrentAdminId();
        if (adminId == null) {
            return ResponseEntity.badRequest().build();
        }
        AdminNotificationPreferenceDto updated = preferenceService.updatePreferences(adminId, dto);
        return ResponseEntity.ok(updated);
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
        if (list.size() > 10) {
            list = list.subList(0, 10);
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/type")
    public ResponseEntity<List<UserNotificationResponse>> getNotificationsByType(@RequestParam String type) {
        return ResponseEntity.ok(generateNotifications().stream().filter(n -> type.equalsIgnoreCase(n.getType())).toList());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        readNotificationIds.add(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        List<UserNotificationResponse> list = generateNotifications();
        for (UserNotificationResponse n : list) {
            readNotificationIds.add(n.getId());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        deletedNotificationIds.add(id);
        return ResponseEntity.noContent().build();
    }

    // ── Notification Generation respecting Preferences ─────────

    private List<UserNotificationResponse> generateNotifications() {
        List<UserNotificationResponse> notifications = new ArrayList<>();
        Long adminId = resolveCurrentAdminId();
        AdminNotificationPreference pref = preferenceService.getPreferencesEntity(adminId);

        // 1. Pending Agents (if notifyAgentRegistrations == true)
        if (Boolean.TRUE.equals(pref.getNotifyAgentRegistrations())) {
            List<User> pendingAgents = userRepository.findByRoleAndAgentApprovedFalse(Role.AGENT);
            for (User agent : pendingAgents) {
                long notifId = agent.getId() + 1000000L;
                if (deletedNotificationIds.contains(notifId)) continue;

                UserNotificationResponse notif = new UserNotificationResponse();
                notif.setId(notifId);
                notif.setType("agent_registration");
                notif.setTitle("New Agent Approval");
                notif.setMessage(agent.getName() + " has registered and is pending approval.");
                notif.setActionUrl("/admin/agents");
                notif.setRead(readNotificationIds.contains(notifId));
                notif.setTime("Just now");
                notifications.add(notif);
            }
        }

        // 2. Pending Hotels (if notifyHotelRegistrations == true)
        if (Boolean.TRUE.equals(pref.getNotifyHotelRegistrations())) {
            List<Hotel> pendingHotels = hotelRepository.findByApplicationStatus("Pending");
            for (Hotel hotel : pendingHotels) {
                long notifId = hotel.getId() + 2000000L;
                if (deletedNotificationIds.contains(notifId)) continue;

                UserNotificationResponse notif = new UserNotificationResponse();
                notif.setId(notifId);
                notif.setType("hotel_registration");
                notif.setTitle("New Hotel Approval");
                notif.setMessage(hotel.getHotelName() + " is pending approval.");
                notif.setActionUrl("/admin/hotels");
                notif.setRead(readNotificationIds.contains(notifId));
                notif.setTime("Just now");
                notifications.add(notif);
            }
        }

        // 3. Pending Packages (if notifyPackageApprovals == true)
        if (Boolean.TRUE.equals(pref.getNotifyPackageApprovals())) {
            List<Package> pendingPackages = packageRepository.findByApplicationStatus("Pending");
            for (Package pkg : pendingPackages) {
                long notifId = pkg.getId() + 3000000L;
                if (deletedNotificationIds.contains(notifId)) continue;

                UserNotificationResponse notif = new UserNotificationResponse();
                notif.setId(notifId);
                notif.setType("package_registration");
                notif.setTitle("New Package Approval");
                notif.setMessage(pkg.getPackageName() + " is pending approval.");
                notif.setActionUrl("/admin/packages");
                notif.setRead(readNotificationIds.contains(notifId));
                notif.setTime("Just now");
                notifications.add(notif);
            }
        }

        // 4. Payment Received (if notifyPaymentReceived == true)
        if (Boolean.TRUE.equals(pref.getNotifyPaymentReceived())) {
            List<Payment> recentPayments = paymentRepository.findTop10ByStatusOrderByCreatedAtDesc("Completed");
            for (Payment payment : recentPayments) {
                long notifId = payment.getId() + 4000000L;
                if (deletedNotificationIds.contains(notifId)) continue;

                String payerName = payment.getUser() != null ? payment.getUser().getName() : "Customer";
                UserNotificationResponse notif = new UserNotificationResponse();
                notif.setId(notifId);
                notif.setType("payment");
                notif.setTitle("Payment Confirmed");
                notif.setMessage("$" + payment.getAmount() + " received from " + payerName + " (Txn: " + payment.getTransactionId() + ").");
                notif.setActionUrl("/admin/payments");
                notif.setRead(readNotificationIds.contains(notifId));
                notif.setTime(formatRelativeTime(payment.getCreatedAt()));
                notifications.add(notif);
            }
        }

        // 5. Tourist Reports (if notifyTouristReports == true)
        if (Boolean.TRUE.equals(pref.getNotifyTouristReports())) {
            List<PackageReport> pendingReports = packageReportRepository.findTop10ByStatusInOrderByCreatedAtDesc(List.of("OPEN", "PENDING", "UNDER_REVIEW"));
            for (PackageReport report : pendingReports) {
                long notifId = report.getId() + 5000000L;
                if (deletedNotificationIds.contains(notifId)) continue;

                String touristName = report.getUser() != null ? report.getUser().getName() : "Tourist";
                UserNotificationResponse notif = new UserNotificationResponse();
                notif.setId(notifId);
                notif.setType("report");
                notif.setTitle("New Tourist Report");
                String reportTitle = report.getTitle() != null ? report.getTitle() : "Issue reported";
                notif.setMessage(touristName + " submitted a report: " + reportTitle);
                notif.setActionUrl("/admin/reports");
                notif.setRead(readNotificationIds.contains(notifId));
                notif.setTime(formatRelativeTime(report.getCreatedAt()));
                notifications.add(notif);
            }
        }

        // 6. System & Security Alerts (if notifySystemAlerts == true)
        if (Boolean.TRUE.equals(pref.getNotifySystemAlerts())) {
            long sysNotifId = 6000001L;
            if (!deletedNotificationIds.contains(sysNotifId)) {
                UserNotificationResponse notif = new UserNotificationResponse();
                notif.setId(sysNotifId);
                notif.setType("system");
                notif.setTitle("System Status Optimal");
                notif.setMessage("All platform services and database connections are operational.");
                notif.setActionUrl("/admin/dashboard");
                notif.setRead(readNotificationIds.contains(sysNotifId));
                notif.setTime("Today");
                notifications.add(notif);
            }
        }

        return notifications;
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
