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

@Service
public class AgentNotificationService {

    private final NotificationRepository notificationRepository;
    public AgentNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }


    public List<NotificationResponse> getNotifications(Long agentId) {
        return notificationRepository
                .findByAgentIdOrderByCreatedAtDesc(agentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long agentId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!notification.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Notification", "agentId", agentId);
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead(Long agentId) {
        List<Notification> unread = notificationRepository
                .findByAgentIdAndRead(agentId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long agentId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (!notification.getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Notification", "agentId", agentId);
        }
        notificationRepository.delete(notification);
    }

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

    private String getRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        if (duration.toMinutes() < 60) return duration.toMinutes() + " min ago";
        if (duration.toHours() < 24) return duration.toHours() + " hours ago";
        return duration.toDays() + " days ago";
    }
}