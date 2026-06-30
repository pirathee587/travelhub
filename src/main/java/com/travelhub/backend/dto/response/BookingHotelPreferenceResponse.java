package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingHotelPreferenceResponse {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String starRating;
    private String district;
    private String imageUrl;
    private String contactNumber;
    private String email;
    private String roomName;
    private Integer preferenceNumber;
    private Boolean isSelected;
}
