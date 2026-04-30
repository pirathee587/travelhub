package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingId;
    private String packageName;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Double totalPrice;
    private Integer progress;
    private String imageUrl;
    private String category;
    private LocalDateTime bookedOn;

    // Hotel info
    private String hotelName;
    private String hotelLocation;

    // Driver & Vehicle info
    private String driverName;
    private String driverPhone;
    private Double driverRating;
    private Integer driverTrips;
    private String vehicleType;
    private String vehicleModel;
    private String vehicleRegistration;
    private String vehicleCapacity;
}