package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.District;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelResponse {
    private Long id;
    private String hotelName;
    private String destination;
    private String location;
    private String description;
    private Double priceFrom;
    private Double priceTo;
    private Double rating;
    private Integer reviewCount;
    private List<String> images;
    private List<String> amenities;
    private District district;
    private String applicationStatus;
    private String hotelEmail;
    private String hotelContactNumber;
    private List<RoomResponse> rooms;
}