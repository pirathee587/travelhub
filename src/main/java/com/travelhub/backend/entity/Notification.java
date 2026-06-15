package com.travelhub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Notification entity represents a system alert or message for an agent.
 * It tracks various event types such as bookings, payments, or cancellations.
 */
@Entity
@Table(name = "notifications")
public class Notification {
    
    // Unique identifier for the notification
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The Agent who is the recipient of this notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    // The category of the notification (e.g., booking, payment, review, cancellation)
    @Column(nullable = false)
    private String type;

    // A short summary or subject of the notification
    @Column(nullable = false)
    private String title;

    // The detailed body text of the notification
    @Column(columnDefinition = "TEXT")
    private String message;

    // Flag indicating whether the notification has been seen/read by the agent
    @Column(nullable = false)
    private Boolean read = false;

    // Timestamp of when the notification was generated
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * Life-cycle hook to set the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Default constructor for JPA.
     */
    public Notification() {}

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Inner Builder class for the fluent creation of Notification objects.
     */
    public static class Builder {
        private Long id;
        private Agent agent;
        private String type;
        private String title;
        private String message;
        private Boolean read;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder agent(Agent agent) { this.agent = agent; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder read(Boolean read) { this.read = read; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        /**
         * Builds and returns a Notification object based on the builder's configuration.
         */
        public Notification build() {
            Notification n = new Notification();
            n.setId(id);
            n.setAgent(agent);
            n.setType(type);
            n.setTitle(title);
            n.setMessage(message);
            if (read != null) n.setRead(read);
            n.setCreatedAt(createdAt);
            return n;
        }
    }

    /**
     * Returns a new Builder instance for Notification.
     */
    public static Builder builder() { return new Builder(); }
}