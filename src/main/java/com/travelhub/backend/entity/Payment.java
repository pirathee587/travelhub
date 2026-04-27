package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TXN-001, TXN-002 format
    @Column(name = "transaction_id",
            unique = true, nullable = false)
    private String transactionId;

    // Booking-உடன் link
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Tourist அல்லது Agent
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Agent/Company name
    // உதாரணம்: Pinnacle Tours, Island Hopper
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    // Payment அல்லது Refund
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double amount;

    // Completed, Pending, Canceled, Failed
    @Column(nullable = false)
    private String status;

    // PayHere Specific Fields
    @Column(name = "payhere_amount")
    private Double payhereAmount;

    @Column(name = "payhere_currency")
    private String payhereCurrency;

    @Column(name = "method")
    private String method;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "md5sig")
    private String md5sig;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}