package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.NotificationResponse;
import com.travelhub.backend.entity.Notification;
import com.travelhub.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminNotificationService {

    private final NotificationRepository notificationRepository;

    // ── GET all notifications (newest first) ─────────
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET unread notifications ──────────────────────
    public List<NotificationResponse> getUnreadNotifications() {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET unread count ──────────────────────────────
    public Map<String, Long> getUnreadCount() {
        return Map.of("count", notificationRepository.countByReadFalse());
    }

    // ── GET latest 10 notifications ───────────────────
    public List<NotificationResponse> getLatestNotifications() {
        return notificationRepository.findTop10ByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET notifications by type ─────────────────────
    public List<NotificationResponse> getNotificationsByType(String type) {
        return notificationRepository.findByTypeOrderByCreatedAtDesc(type)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── PATCH mark single notification as read ────────
    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        n.setRead(true);
        return toResponse(notificationRepository.save(n));
    }

    // ── PATCH mark all as read ────────────────────────
    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // ── DELETE single notification ────────────────────
    @Transactional
    public void deleteNotification(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notificationRepository.delete(n);
    }

    // ── Map entity → DTO ─────────────────────────────
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
        Duration d = Duration.between(createdAt, LocalDateTime.now());
        if (d.toMinutes() < 60)  return d.toMinutes() + " min ago";
        if (d.toHours()   < 24)  return d.toHours()   + " hours ago";
        return d.toDays() + " days ago";
    }
}
