package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "agent_id", nullable = false, unique = true)
    private Agent agent;

    private Boolean notifyNewBooking = true;
    private Boolean notifyCancellation = true;
    private Boolean notifyTripCompleted = true;
    private Boolean notifyNewReview = true;
    private Boolean notifyPaymentReceived = true;
    private Boolean notifyPromoUpdates = false;

    private String currency = "USD";
}