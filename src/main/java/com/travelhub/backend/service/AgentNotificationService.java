package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.entity.Notification;
import com.travelhub.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AgentNotificationService manages the lifecycle of system alerts for travel agents.
 * It provides methods for retrieving, reading, and deleting notifications with relative time formatting.
 */
@Service
public class AgentNotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Constructor injection for notification data access.
     */
    public AgentNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Retrieves all notifications for a specific agent, ordered from newest to oldest.
     */
    public List<NotificationResponse> getNotifications(Long agentId) {
        return notificationRepository
                .findByAgentIdOrderByCreatedAtDesc(agentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Marks a specific notification as 'read' after verifying agent ownership.
     */
    public NotificationResponse markAsRead(Long agentId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        // Security check: Ensure the notification belongs to the requesting agent
        if (!notification.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Notification", "agentId", agentId);
        }
        
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    /**
     * Bulk operation to mark all current unread notifications for an agent as 'read'.
     */
    public void markAllAsRead(Long agentId) {
        List<Notification> unread = notificationRepository
                .findByAgentIdAndRead(agentId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Permanently deletes a specific notification, ensuring agent ownership.
     */
    public void deleteNotification(Long agentId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        if (!notification.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Notification", "agentId", agentId);
        }
        
        notificationRepository.delete(notification);
    }

    /**
     * Maps a Notification entity to a response DTO.
     * Includes a calculated relative time string for the UI.
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
     * Helper to format the creation timestamp into a human-readable relative string.
     * Output examples: "10 min ago", "2 hours ago", "3 days ago".
     */
    private String getRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        
        if (duration.toMinutes() < 60) {
            return duration.toMinutes() + " min ago";
        }
        if (duration.toHours() < 24) {
            return duration.toHours() + " hours ago";
        }
        return duration.toDays() + " days ago";
    }
}