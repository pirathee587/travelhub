package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.service.AgentNotificationService;
import com.travelhub.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AgentNotificationController
 *
 * Base path : /api/v1/agent/notifications
 * Security  : agentId resolved from JWT — NOT from URL path (safe ✅)
 *
 * Frontend  : agentNotificationApi.js calls /v1/agent/notifications (no agentId in URL)
 */
@RestController
@RequestMapping("/api/v1/agent/notifications")
@RequiredArgsConstructor
public class AgentNotificationController {

    private final AgentNotificationService agentNotificationService;

    // GET /api/v1/agent/notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        Long agentId = SecurityUtils.getCurrentAgentId();
        return ResponseEntity.ok(agentNotificationService.getNotifications(agentId));
    }

    // PATCH /api/v1/agent/notifications/{id}/read
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId) {
        Long agentId = SecurityUtils.getCurrentAgentId();
        return ResponseEntity.ok(
                agentNotificationService.markAsRead(agentId, notificationId));
    }

    // PATCH /api/v1/agent/notifications/read-all
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long agentId = SecurityUtils.getCurrentAgentId();
        agentNotificationService.markAllAsRead(agentId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/v1/agent/notifications/{id}
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId) {
        Long agentId = SecurityUtils.getCurrentAgentId();
        agentNotificationService.deleteNotification(agentId, notificationId);
        return ResponseEntity.noContent().build();
    }
}