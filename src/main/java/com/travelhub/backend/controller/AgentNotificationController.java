package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.service.AgentNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * AgentNotificationController manages the communication alerts for travel agents.
 * It provides endpoints for retrieving system notifications and managing their read/delete status.
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentNotificationController {

    private final AgentNotificationService agentNotificationService;

    /**
     * Constructor injection for notification business logic.
     */
    public AgentNotificationController(AgentNotificationService agentNotificationService) {
        this.agentNotificationService = agentNotificationService;
    }

    /**
     * Retrieves all notifications for a specific agent.
     * Ordered by most recent first by default in the service layer.
     */
    @GetMapping("/{agentId}/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentNotificationService.getNotifications(agentId));
    }

    /**
     * Endpoint to mark a specific notification as 'read'.
     */
    @PatchMapping("/{agentId}/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long agentId,
            @PathVariable Long notificationId) {
        return ResponseEntity.ok(agentNotificationService.markAsRead(agentId, notificationId));
    }

    /**
     * Endpoint to perform a bulk update, marking all unread notifications for an agent as 'read'.
     */
    @PatchMapping("/{agentId}/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long agentId) {
        agentNotificationService.markAllAsRead(agentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint to permanently remove a notification for an agent.
     */
    @DeleteMapping("/{agentId}/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long agentId,
            @PathVariable Long notificationId) {
        agentNotificationService.deleteNotification(agentId, notificationId);
        return ResponseEntity.noContent().build();
    }
}