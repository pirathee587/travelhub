package com.travelhub.backend.dto.response;

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
        String  imageUrl,
        String  district,
        String  applicationStatus,
        Integer numberOfRooms
) {}