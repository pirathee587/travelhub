package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class BookingActionRequest {
    private String declineReason; // only used when declining
    private Long vehicleId; // for accepting — assign vehicle
}