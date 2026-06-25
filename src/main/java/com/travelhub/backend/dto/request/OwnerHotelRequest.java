package com.travelhub.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.travelhub.backend.enums.District;

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
    private java.util.List<String> existingImages;
    private District district;
    private String phoneNumber;
    private String hotlineNumber;
    private String ownerName;
    private String ownerEmail;
    private String ownerNic;
}
