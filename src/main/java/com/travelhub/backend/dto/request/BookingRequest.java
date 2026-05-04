package com.travelhub.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    private Long userId;
    private Long packageId;
    private Long hotelId;
    private java.util.List<Long> hotelIds;
    private Long vehicleId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalPrice;
}