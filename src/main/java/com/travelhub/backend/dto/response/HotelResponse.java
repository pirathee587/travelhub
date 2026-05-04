package com.travelhub.backend.dto.response;

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
    private String imageUrl;
    private List<String> amenities;
    private String district;
    private String applicationStatus;
    private String hotelEmail;
    private String hotelContactNumber;
}