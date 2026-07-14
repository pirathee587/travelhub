package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class BookingActionRequest {
    private String declineReason; // only used when declining
    private Long vehicleId; // for accepting — assign vehicle
    private Long hotelId; // for accepting — select hotel preference
    private Long driverId; // for assigning driver
}