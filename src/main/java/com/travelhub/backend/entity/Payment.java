package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Payment entity represents a financial transaction in the system.
 * It tracks payments made by tourists, linked to bookings and processed via PayHere.
 */
@Entity
@Table(name = "payments")
public class Payment {

    /**
     * Default constructor for JPA.
     */
    public Payment() {}
    
    // --- Getters and Setters ---
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getPayhereAmount() { return payhereAmount; }
    public void setPayhereAmount(Double payhereAmount) { this.payhereAmount = payhereAmount; }
    public String getPayhereCurrency() { return payhereCurrency; }
    public void setPayhereCurrency(String payhereCurrency) { this.payhereCurrency = payhereCurrency; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public Integer getStatusCode() { return statusCode; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }
    public String getMd5sig() { return md5sig; }
    public void setMd5sig(String md5sig) { this.md5sig = md5sig; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Unique internal identifier for the payment record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // External transaction ID (e.g., TXN-001) used for tracking and auditing
    @Column(name = "transaction_id",
            unique = true, nullable = false)
    private String transactionId;

    // Relationship: The specific booking associated with this payment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // Relationship: The User (usually a tourist) who initiated the payment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Relationship: The Agent who will receive the payment for their service
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    // Nature of the transaction (e.g., Payment, Refund)
    @Column(nullable = false)
    private String type;

    // The transaction amount in the system's base currency
    @Column(nullable = false)
    private Double amount;

    // Current state of the transaction (e.g., Completed, Pending, Canceled, Failed)
    @Column(nullable = false)
    private String status;

    // --- PayHere Specific Integration Fields ---
    
    // Amount processed specifically through the PayHere gateway
    @Column(name = "payhere_amount")
    private Double payhereAmount;

    // Currency code returned by PayHere (e.g., LKR, USD)
    @Column(name = "payhere_currency")
    private String payhereCurrency;

    // Payment method used (e.g., VISA, MASTER, AMEX)
    @Column(name = "method")
    private String method;

    // Numeric status code returned by the PayHere API
    @Column(name = "status_code")
    private Integer statusCode;

    // MD5 signature used for verifying the authenticity of PayHere callbacks
    @Column(name = "md5sig")
    private String md5sig;

    // Timestamp of when the payment record was first created
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Life-cycle hook to set the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}