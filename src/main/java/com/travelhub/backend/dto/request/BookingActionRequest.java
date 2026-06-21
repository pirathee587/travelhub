package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class BookingActionRequest {
    private String declineReason; // used when agent declines a pending booking
    private String cancelReason;  // used when agent cancels a confirmed/in-progress booking
    private Long vehicleId;       // used when agent accepts a booking and assigns a vehicle
}