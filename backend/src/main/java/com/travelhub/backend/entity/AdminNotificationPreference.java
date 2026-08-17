package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false, unique = true)
    private User admin;

    @Column(name = "notify_agent_registrations", nullable = false)
    @Builder.Default
    private Boolean notifyAgentRegistrations = true;

    @Column(name = "notify_hotel_registrations", nullable = false)
    @Builder.Default
    private Boolean notifyHotelRegistrations = true;

    @Column(name = "notify_package_approvals", nullable = false)
    @Builder.Default
    private Boolean notifyPackageApprovals = true;

    @Column(name = "notify_payment_received", nullable = false)
    @Builder.Default
    private Boolean notifyPaymentReceived = true;

    @Column(name = "notify_tourist_reports", nullable = false)
    @Builder.Default
    private Boolean notifyTouristReports = true;

    @Column(name = "notify_system_alerts", nullable = false)
    @Builder.Default
    private Boolean notifySystemAlerts = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
