package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.service.AgentNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentNotificationController {

    private final AgentNotificationService agentNotificationService;

    @GetMapping("/{agentId}/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentNotificationService.getNotifications(agentId));
    }

    @PatchMapping("/{agentId}/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long agentId,
            @PathVariable Long notificationId) {
        return ResponseEntity.ok(agentNotificationService.markAsRead(agentId, notificationId));
    }

    @PatchMapping("/{agentId}/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long agentId) {
        agentNotificationService.markAllAsRead(agentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{agentId}/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long agentId,
            @PathVariable Long notificationId) {
        agentNotificationService.deleteNotification(agentId, notificationId);
        return ResponseEntity.noContent().build();
    }
}