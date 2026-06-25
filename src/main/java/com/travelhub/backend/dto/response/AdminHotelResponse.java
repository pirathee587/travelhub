package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.District;

public record AdminHotelResponse(
        Long    id,
        String  hotelName,
        String  destination,
        String  location,
        String  description,
        Double  priceFrom,
        Double  priceTo,
        Double  rating,
        Integer reviewCount,
        java.util.List<String> images,
        District  district,
        String applicationStatus
) {}