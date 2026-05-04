package com.travelhub.backend.dto.response;

public record RoomResponse(
        String id,
        String name,
        String type,
        double price,
        String description,
        String imageUrl,
        Boolean availability,
        Long hotelId
) {}
