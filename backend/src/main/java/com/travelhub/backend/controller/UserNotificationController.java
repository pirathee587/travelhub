package com.travelhub.backend.controller;

import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.service.UserNotificationService;
import com.travelhub.backend.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/me/notifications")
public class UserNotificationController {

    private final UserNotificationService userNotificationService;

    public UserNotificationController(UserNotificationService userNotificationService) {
        this.userNotificationService = userNotificationService;
    }

    @GetMapping
    public ResponseEntity<List<UserNotificationResponse>> getNotifications() {
        return ResponseEntity.ok(userNotificationService.getUserNotifications(requireUserId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", userNotificationService.getUnreadCount(requireUserId())));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<UserNotificationResponse> markAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(userNotificationService.markAsRead(requireUserId(), notificationId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        userNotificationService.markAllAsRead(requireUserId());
        return ResponseEntity.ok().build();
    }

    private Long requireUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
