package com.travelhub.backend.entity;

import jakarta.persistence.*;

/**
 * AgentSettings entity represents the personal configuration and notification preferences for an agent.
 * It allows agents to toggle specific system alerts and set their preferred currency.
 */
@Entity
@Table(name = "agent_settings")
public class AgentSettings {
    
    // Unique identifier for the agent settings record
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: The specific Agent that these settings belong to
    @OneToOne
    @JoinColumn(name = "agent_id", nullable = false, unique = true)
    private Agent agent;

    // --- Notification Preferences ---
    
    // Toggle for receiving alerts about new bookings
    private Boolean notifyNewBooking = true;
    
    // Toggle for receiving alerts about booking cancellations
    private Boolean notifyCancellation = true;
    
    // Toggle for receiving alerts when a trip is successfully completed
    private Boolean notifyTripCompleted = true;
    
    // Toggle for receiving alerts when a new review is posted for their package
    private Boolean notifyNewReview = true;
    
    // Toggle for receiving alerts when a payment is successfully received
    private Boolean notifyPaymentReceived = true;
    
    // Toggle for receiving general promotional or system update alerts
    private Boolean notifyPromoUpdates = false;

    // The preferred currency for displaying financial information to the agent (e.g., USD, LKR)
    private String currency = "USD";

    /**
     * Default constructor for JPA.
     */
    public AgentSettings() {}

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public Boolean getNotifyNewBooking() { return notifyNewBooking; }
    public void setNotifyNewBooking(Boolean notifyNewBooking) { this.notifyNewBooking = notifyNewBooking; }
    public Boolean getNotifyCancellation() { return notifyCancellation; }
    public void setNotifyCancellation(Boolean notifyCancellation) { this.notifyCancellation = notifyCancellation; }
    public Boolean getNotifyTripCompleted() { return notifyTripCompleted; }
    public void setNotifyTripCompleted(Boolean notifyTripCompleted) { this.notifyTripCompleted = notifyTripCompleted; }
    public Boolean getNotifyNewReview() { return notifyNewReview; }
    public void setNotifyNewReview(Boolean notifyNewReview) { this.notifyNewReview = notifyNewReview; }
    public Boolean getNotifyPaymentReceived() { return notifyPaymentReceived; }
    public void setNotifyPaymentReceived(Boolean notifyPaymentReceived) { this.notifyPaymentReceived = notifyPaymentReceived; }
    public Boolean getNotifyPromoUpdates() { return notifyPromoUpdates; }
    public void setNotifyPromoUpdates(Boolean notifyPromoUpdates) { this.notifyPromoUpdates = notifyPromoUpdates; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    /**
     * Inner Builder class for the fluent creation of AgentSettings objects.
     */
    public static class Builder {
        private Long id;
        private Agent agent;
        private Boolean notifyNewBooking;
        private Boolean notifyCancellation;
        private Boolean notifyTripCompleted;
        private Boolean notifyNewReview;
        private Boolean notifyPaymentReceived;
        private Boolean notifyPromoUpdates;
        private String currency;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder agent(Agent agent) { this.agent = agent; return this; }
        public Builder notifyNewBooking(Boolean notifyNewBooking) { this.notifyNewBooking = notifyNewBooking; return this; }
        public Builder notifyCancellation(Boolean notifyCancellation) { this.notifyCancellation = notifyCancellation; return this; }
        public Builder notifyTripCompleted(Boolean notifyTripCompleted) { this.notifyTripCompleted = notifyTripCompleted; return this; }
        public Builder notifyNewReview(Boolean notifyNewReview) { this.notifyNewReview = notifyNewReview; return this; }
        public Builder notifyPaymentReceived(Boolean notifyPaymentReceived) { this.notifyPaymentReceived = notifyPaymentReceived; return this; }
        public Builder notifyPromoUpdates(Boolean notifyPromoUpdates) { this.notifyPromoUpdates = notifyPromoUpdates; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }

        /**
         * Builds and returns an AgentSettings object based on the builder's configuration.
         */
        public AgentSettings build() {
            AgentSettings s = new AgentSettings();
            s.setId(id);
            s.setAgent(agent);
            if (notifyNewBooking != null) s.setNotifyNewBooking(notifyNewBooking);
            if (notifyCancellation != null) s.setNotifyCancellation(notifyCancellation);
            if (notifyTripCompleted != null) s.setNotifyTripCompleted(notifyTripCompleted);
            if (notifyNewReview != null) s.setNotifyNewReview(notifyNewReview);
            if (notifyPaymentReceived != null) s.setNotifyPaymentReceived(notifyPaymentReceived);
            if (notifyPromoUpdates != null) s.setNotifyPromoUpdates(notifyPromoUpdates);
            if (currency != null) s.setCurrency(currency);
            return s;
        }
    }

    /**
     * Returns a new Builder instance for AgentSettings.
     */
    public static Builder builder() { return new Builder(); }
}