package com.travelhub.backend.dto.response;

public record AdminHotelResponse(
        Long    id,
        String  hotelName,
        String  destination,
        String  location,
        String  description,
        Double  priceFrom,
        Double  priceTo,
        String  imageUrl,
        String  district,
        String applicationStatus
) {}