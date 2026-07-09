package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor

@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    // GET /api/admin/notifications
    @GetMapping
    public ResponseEntity<?> getAllNotifications() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Notifications found",
                        adminNotificationService.getAllNotifications()));
    }

    // GET /api/admin/notifications/unread
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Unread notifications",
                        adminNotificationService.getUnreadNotifications()));
    }

    // GET /api/admin/notifications/count
    @GetMapping("/count")
    public ResponseEntity<?> getUnreadCount() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Unread count",
                        adminNotificationService.getUnreadCount()));
    }

    // GET /api/admin/notifications/latest
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestNotifications() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Latest notifications",
                        adminNotificationService.getLatestNotifications()));
    }

    // GET /api/admin/notifications/type?type=booking
    @GetMapping("/type")
    public ResponseEntity<?> getByType(@RequestParam String type) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Notifications by type",
                        adminNotificationService.getNotificationsByType(type)));
    }

    // PATCH /api/admin/notifications/{id}/read
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Marked as read",
                        adminNotificationService.markAsRead(id)));
    }

    // PATCH /api/admin/notifications/read-all
    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        adminNotificationService.markAllAsRead();
        return ResponseEntity.ok(
                new ApiResponse(true, "All marked as read", null));
    }

    // DELETE /api/admin/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        adminNotificationService.deleteNotification(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Notification deleted", null));
    }
}
