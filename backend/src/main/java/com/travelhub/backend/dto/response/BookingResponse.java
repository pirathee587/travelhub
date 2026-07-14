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
    private String packageId;
    private String packageName;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Double totalPrice;
    private Integer progress;
    private String imageUrl;
    private String category;
    private String startPlace;
    private String endPlace;
    private LocalDateTime bookedOn;
    private Integer adults;
    private Integer children;
    private String specialRequests;
    private String duration;
    
    private String touristName;
    private String touristEmail;
    private String touristPhone;
    private String packageType;
    private String accommodationOption;

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
    private String hotelIdsWithPreference;
    private java.util.List<String> preferredHotels;
    private java.util.List<String> itineraryHotels;
    private java.util.List<HotelPreferenceDetail> hotelPreferences;

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class HotelPreferenceDetail {
        private Long id;
        private Long hotelId;
        private Integer preferenceNumber;
        private String hotelName;
        private String imageUrl;
        private String starRating;
        private String district;
        private String roomName;
        private String contactNumber;
        private String email;
    }
}