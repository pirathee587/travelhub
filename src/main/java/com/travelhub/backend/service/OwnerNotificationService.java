package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.OwnerNotificationResponse;
import com.travelhub.backend.entity.OwnerNotification;
import com.travelhub.backend.repository.OwnerNotificationRepository;
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
public class OwnerNotificationService {

    private final OwnerNotificationRepository repo;

    // ── List all notifications for an owner ───────────
    public List<OwnerNotificationResponse> getNotifications(Long ownerId) {
        return repo.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Unread count ──────────────────────────────────
    public Map<String, Long> getUnreadCount(Long ownerId) {
        return Map.of("count", repo.countByOwnerIdAndIsReadFalse(ownerId));
    }

    // ── Mark single notification as read ──────────────
    @Transactional
    public OwnerNotificationResponse markAsRead(Long ownerId, Long notificationId) {
        OwnerNotification n = repo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("OwnerNotification", "id", notificationId));
        if (!n.getOwnerId().equals(ownerId)) {
            throw new ResourceNotFoundException("OwnerNotification", "ownerId", ownerId);
        }
        n.setIsRead(true);
        return toResponse(repo.save(n));
    }

    // ── Mark all as read ──────────────────────────────
    @Transactional
    public void markAllAsRead(Long ownerId) {
        repo.markAllReadByOwnerId(ownerId);
    }

    // ── Delete notification ───────────────────────────
    @Transactional
    public void deleteNotification(Long ownerId, Long notificationId) {
        OwnerNotification n = repo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("OwnerNotification", "id", notificationId));
        if (!n.getOwnerId().equals(ownerId)) {
            throw new ResourceNotFoundException("OwnerNotification", "ownerId", ownerId);
        }
        repo.delete(n);
    }

    // ── Save a new notification (called by listener) ──
    @Transactional
    public void save(Long ownerId, Long hotelId, String type, String title, String message) {
        repo.save(OwnerNotification.builder()
                .ownerId(ownerId)
                .hotelId(hotelId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build());
    }

    // ── Map entity → DTO ──────────────────────────────
    private OwnerNotificationResponse toResponse(OwnerNotification n) {
        return OwnerNotificationResponse.builder()
                .id(n.getId())
                .hotelId(n.getHotelId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .time(relativeTime(n.getCreatedAt()))
                .read(n.getIsRead())
                .build();
    }

    private String relativeTime(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        Duration d = Duration.between(createdAt, LocalDateTime.now());
        if (d.toMinutes() < 60) return d.toMinutes() + " min ago";
        if (d.toHours()   < 24) return d.toHours()   + " hours ago";
        return d.toDays() + " days ago";
    }
}
