package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")




public class Payment {
    public Payment() {}
    
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