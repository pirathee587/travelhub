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

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PackageRepository packageRepository;

    @GetMapping
    public ResponseEntity<List<UserNotificationResponse>> getAllNotifications() {
        return ResponseEntity.ok(generateNotifications());
    }

    @GetMapping("/unread")
    public ResponseEntity<List<UserNotificationResponse>> getUnreadNotifications() {
        return ResponseEntity.ok(generateNotifications());
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", (long) generateNotifications().size()));
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
        // Since admin notifications are dynamically generated based on pending status,
        // marking them as read is handled client-side. The server doesn't need to persist this state.
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    private List<UserNotificationResponse> generateNotifications() {
        List<UserNotificationResponse> notifications = new ArrayList<>();

        // 1. Pending Agents
        List<User> pendingAgents = userRepository.findByRoleAndAgentApprovedFalse(Role.AGENT);
        for (User agent : pendingAgents) {
            UserNotificationResponse notif = new UserNotificationResponse();
            notif.setId(agent.getId() + 1000000L); // Unique ID space
            notif.setType("agent_registration");
            notif.setTitle("New Agent Approval");
            notif.setMessage(agent.getName() + " has registered and is pending approval.");
            notif.setActionUrl("/admin/agencies");
            notif.setRead(false);
            notif.setTime("Just now");
            notifications.add(notif);
        }

        // 2. Pending Hotels
        List<Hotel> pendingHotels = hotelRepository.findByApplicationStatus("Pending");
        for (Hotel hotel : pendingHotels) {
            UserNotificationResponse notif = new UserNotificationResponse();
            notif.setId(hotel.getId() + 2000000L);
            notif.setType("hotel_registration");
            notif.setTitle("New Hotel Approval");
            notif.setMessage(hotel.getHotelName() + " is pending approval.");
            notif.setActionUrl("/admin/hotels");
            notif.setRead(false);
            notif.setTime("Just now");
            notifications.add(notif);
        }

        // 3. Pending Packages
        List<Package> pendingPackages = packageRepository.findByApplicationStatus("Pending");
        for (Package pkg : pendingPackages) {
            UserNotificationResponse notif = new UserNotificationResponse();
            notif.setId(pkg.getId() + 3000000L);
            notif.setType("package_registration");
            notif.setTitle("New Package Approval");
            notif.setMessage(pkg.getPackageName() + " is pending approval.");
            notif.setActionUrl("/admin/packages");
            notif.setRead(false);
            notif.setTime("Just now");
            notifications.add(notif);
        }

        return notifications;
    }
}
