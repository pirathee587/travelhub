package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.OwnerNotificationResponse;
import com.travelhub.backend.service.OwnerNotificationService;
import com.travelhub.backend.util.OwnerContextResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * OwnerNotificationController
 *
 * Base path : /api/v1/owner/notifications
 * ownerId is resolved from the X-Owner-Id header (dev) or JWT (prod)
 */
@RestController
@RequestMapping("/api/v1/owner/notifications")
@RequiredArgsConstructor
public class OwnerNotificationController {

    private final OwnerNotificationService ownerNotificationService;
    private final OwnerContextResolver ownerContextResolver;

    // GET /api/v1/owner/notifications
    @GetMapping
    public ResponseEntity<List<OwnerNotificationResponse>> getNotifications(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(ownerNotificationService.getNotifications(ownerId));
    }

    // GET /api/v1/owner/notifications/count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) return ResponseEntity.ok(Map.of("count", 0L));
        return ResponseEntity.ok(ownerNotificationService.getUnreadCount(ownerId));
    }

    // PATCH /api/v1/owner/notifications/{id}/read
    @PatchMapping("/{id}/read")
    public ResponseEntity<OwnerNotificationResponse> markAsRead(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId,
            @PathVariable Long id) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(ownerNotificationService.markAsRead(ownerId, id));
    }

    // PATCH /api/v1/owner/notifications/read-all
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId != null) ownerNotificationService.markAllAsRead(ownerId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/v1/owner/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId,
            @PathVariable Long id) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId != null) ownerNotificationService.deleteNotification(ownerId, id);
        return ResponseEntity.noContent().build();
    }
}
