package com.travelhub.backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer adults;
    private Integer children;
    private String specialRequests;
    private String duration;

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

    // Booking details
    private Integer adults;
    private Integer children;
    private String specialRequests;
    private String duration;
    private String hotelIdsWithPreference;
}