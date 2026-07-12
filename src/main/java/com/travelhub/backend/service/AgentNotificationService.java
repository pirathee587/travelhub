package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.entity.Notification;
import com.travelhub.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentNotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Returns notifications for the agent in newest-first order.
     */
    public List<NotificationResponse> getNotifications(Long agentId) {
        return notificationRepository
                .findByAgentIdOrderByCreatedAtDesc(agentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Marks a single notification as read after ownership validation.
     */
    public NotificationResponse markAsRead(Long agentId, Long notificationId) {
        // Find notification by id.
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        // Ownership check: agent can only update their own notifications.
        if (!notification.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Notification", "agentId", agentId);
        }
        // Mark read and persist.
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    /**
     * Marks all unread notifications as read for the given agent.
     */
    public void markAllAsRead(Long agentId) {
        // Load unread records only, then bulk-update read state.
        List<Notification> unread = notificationRepository
                .findByAgentIdAndRead(agentId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Deletes one notification after ownership validation.
     */
    public void deleteNotification(Long agentId, Long notificationId) {
        // Find notification by id.
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        // Ownership check: agent can only delete their own notifications.
        if (!notification.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Notification", "agentId", agentId);
        }
        // Delete record.
        notificationRepository.delete(notification);
    }

    /**
     * Maps Notification entity -> response DTO.
     */
    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .time(getRelativeTime(n.getCreatedAt()))
                .read(n.getRead())
                .build();
    }

    /**
     * Formats createdAt into a short human-readable relative time string.
     */
    private String getRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        if (duration.toMinutes() < 60) return duration.toMinutes() + " min ago";
        if (duration.toHours() < 24) return duration.toHours() + " hours ago";
        return duration.toDays() + " days ago";
    }
}
