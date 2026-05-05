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

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentNotificationService.getNotifications(agentId));
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentNotificationService.markAsRead(agentId, notificationId));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        agentNotificationService.markAllAsRead(agentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        agentNotificationService.deleteNotification(agentId, notificationId);
        return ResponseEntity.noContent().build();
    }
}