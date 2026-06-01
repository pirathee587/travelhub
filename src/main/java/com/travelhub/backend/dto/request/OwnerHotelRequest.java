package com.travelhub.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerHotelRequest {
    private String hotelName;
    private String destination;
    private String location;
    private String description;
    private Double priceFrom;
    private Double priceTo;
    private String imageUrl;
    private String district;
    private String phoneNumber;
    private String hotlineNumber;
    private String ownerName;
    private String ownerEmail;
    private String ownerNic;
}
