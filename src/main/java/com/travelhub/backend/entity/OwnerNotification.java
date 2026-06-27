package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "owner_notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The hotel owner's user ID */
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    /** The hotel this notification refers to */
    @Column(name = "hotel_id")
    private Long hotelId;

    /** APPROVED | REJECTED | SUSPENDED */
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
