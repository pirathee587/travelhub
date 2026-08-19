package com.travelhub.backend.controller;

import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.service.UserNotificationService;
import com.travelhub.backend.util.OwnerContextResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner/notifications")
@RequiredArgsConstructor
public class OwnerNotificationController {

    private final UserNotificationService userNotificationService;
    private final OwnerContextResolver ownerContextResolver;

    @GetMapping
    public ResponseEntity<List<UserNotificationResponse>> getNotifications(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        return ResponseEntity.ok(userNotificationService.getUserNotifications(requireOwnerId(devOwnerId)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        return ResponseEntity.ok(Map.of("count", userNotificationService.getUnreadCount(requireOwnerId(devOwnerId))));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<UserNotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        return ResponseEntity.ok(userNotificationService.markAsRead(requireOwnerId(devOwnerId), notificationId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        userNotificationService.markAllAsRead(requireOwnerId(devOwnerId));
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        userNotificationService.deleteNotification(requireOwnerId(devOwnerId), notificationId);
        return ResponseEntity.ok().build();
    }

    private Long requireOwnerId(Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) {
            throw new UnauthorizedException("Owner authentication required");
        }
        return ownerId;
    }
}
