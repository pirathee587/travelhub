package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Notification;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.UserNotification;
import com.travelhub.backend.repository.NotificationRepository;
import com.travelhub.backend.repository.UserNotificationRepository;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserNotificationService {

    private final UserNotificationRepository userNotificationRepository;
    private final NotificationRepository agentNotificationRepository;
    private final UserRepository userRepository;

    public UserNotificationService(UserNotificationRepository userNotificationRepository,
                                   NotificationRepository agentNotificationRepository,
                                   UserRepository userRepository) {
        this.userNotificationRepository = userNotificationRepository;
        this.agentNotificationRepository = agentNotificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyUser(Long userId, String type, String title, String message, String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setRead(false);
        userNotificationRepository.save(notification);
    }

    @Transactional
    public void notifyAgent(Agent agent, String type, String title, String message) {
        if (agent == null) {
            return;
        }
        Notification notification = Notification.builder()
                .agent(agent)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .build();
        agentNotificationRepository.save(notification);
    }

    public List<UserNotificationResponse> getUserNotifications(Long userId) {
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return userNotificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public UserNotificationResponse markAsRead(Long userId, Long notificationId) {
        UserNotification notification = userNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("UserNotification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("UserNotification", "userId", userId);
        }

        notification.setRead(true);
        return toResponse(userNotificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<UserNotification> unread = userNotificationRepository
                .findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
        unread.forEach(n -> n.setRead(true));
        userNotificationRepository.saveAll(unread);
    }

    private UserNotificationResponse toResponse(UserNotification notification) {
        UserNotificationResponse response = new UserNotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setActionUrl(notification.getActionUrl());
        response.setRead(notification.getRead());
        response.setTime(getRelativeTime(notification.getCreatedAt()));
        return response;
    }

    private String getRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "";
        }
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        if (duration.toMinutes() < 1) {
            return "Just now";
        }
        if (duration.toMinutes() < 60) {
            return duration.toMinutes() + " min ago";
        }
        if (duration.toHours() < 24) {
            return duration.toHours() + " hours ago";
        }
        return duration.toDays() + " days ago";
    }
}
