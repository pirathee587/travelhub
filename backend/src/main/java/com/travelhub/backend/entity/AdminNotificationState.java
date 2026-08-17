package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Persists per-admin read/deleted state for dynamically-generated notifications.
 * Replaces the in-memory ConcurrentHashMap that was lost on every server restart.
 */
@Entity
@Table(
    name = "admin_notification_states",
    uniqueConstraints = @UniqueConstraint(columnNames = {"admin_id", "notif_id", "state"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "notif_id", nullable = false)
    private Long notifId;

    /** Either 'READ' or 'DELETED' */
    @Column(name = "state", nullable = false, length = 10)
    private String state;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
