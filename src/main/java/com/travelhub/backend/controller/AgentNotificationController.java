package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.service.AgentNotificationService;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.util.SecurityUtils;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.entity.Agent;
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
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentNotificationController {

    private final AgentNotificationService agentNotificationService;
    private final AgentRepository agentRepository;

    // ── TOKEN BASED MAPPINGS ───────────────────────────────────────

    // GET /api/v1/agent/notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotificationsToken() {
        return ResponseEntity.ok(agentNotificationService.getNotifications(requireAgentId()));
    }

    // PATCH /api/v1/agent/notifications/{id}/read
    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsReadToken(
            @PathVariable Long notificationId) {
        return ResponseEntity.ok(
                agentNotificationService.markAsRead(requireAgentId(), notificationId));
    }

    // PATCH /api/v1/agent/notifications/read-all
    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllAsReadToken() {
        agentNotificationService.markAllAsRead(requireAgentId());
        return ResponseEntity.ok().build();
    }

    // DELETE /api/v1/agent/notifications/{id}
    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotificationToken(
            @PathVariable Long notificationId) {
        agentNotificationService.deleteNotification(requireAgentId(), notificationId);
        return ResponseEntity.noContent().build();
    }

    private Long requireAgentId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return agentRepository.findByOwnerId(userId)
                .map(Agent::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", userId));
    }

    // ── PATH VARIABLE BASED MAPPINGS ───────────────────────────────

    // GET /api/v1/agent/{agentId}/notifications
    @GetMapping("/{agentId}/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(agentNotificationService.getNotifications(agentId));
    }

    // PATCH /api/v1/agent/{agentId}/notifications/{id}/read
    @PatchMapping("/{agentId}/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long agentId,
            @PathVariable Long notificationId) {
        return ResponseEntity.ok(
                agentNotificationService.markAsRead(agentId, notificationId));
    }

    // PATCH /api/v1/agent/{agentId}/notifications/read-all
    @PatchMapping("/{agentId}/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Long agentId) {
        agentNotificationService.markAllAsRead(agentId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/v1/agent/{agentId}/notifications/{id}
    @DeleteMapping("/{agentId}/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long agentId,
            @PathVariable Long notificationId) {
        agentNotificationService.deleteNotification(agentId, notificationId);
        return ResponseEntity.noContent().build();
    }
}