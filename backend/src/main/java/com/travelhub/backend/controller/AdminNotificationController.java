package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PackageRepository packageRepository;

    private final Set<Long> readNotificationIds = ConcurrentHashMap.newKeySet();
    private final Set<Long> deletedNotificationIds = ConcurrentHashMap.newKeySet();

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
        return ResponseEntity.ok(generateNotifications().stream().filter(n -> type.equals(n.getType())).toList());
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

    private List<UserNotificationResponse> generateNotifications() {
        List<UserNotificationResponse> notifications = new ArrayList<>();

        // 1. Pending Agents
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

        // 2. Pending Hotels
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

        // 3. Pending Packages
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

        return notifications;
    }
}
