package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class AmenityRequest {
    private String name;
    private String description;
    private String iconName;
    private Long hotelId; // Added hotelId so amenities link to the correct hotel
}
