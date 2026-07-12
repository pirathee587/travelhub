package com.travelhub.backend.dto.request;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class BookingRequest {
    private Long userId;
    private Long packageId;
    private List<Long> hotelIds;
    private LocalDate startDate;
    private Double totalPrice;
    private Integer adults;
    private Integer children;
    private String specialRequests;
    private String duration;
    private String accommodationOption;  // "SELF_ARRANGE" or "AGENCY"
    private List<HotelPreferenceDto> bookingHotelPreferences;

    @Data
    public static class HotelPreferenceDto {
        private Long hotelId;
        private String roomName;
    }
}