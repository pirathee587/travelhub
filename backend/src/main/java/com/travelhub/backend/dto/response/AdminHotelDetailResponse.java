package com.travelhub.backend.dto.response;

import java.util.List;

public record AdminHotelDetailResponse(

        // ── Basic ──────────────────────────────────────
        Long   id,
        String hotelName,
        Double rating,
        Integer reviewCount,
        String imageUrl,
        List<String> images,
        Double priceFrom,
        Double priceTo,

        // ── Location Details ───────────────────────────
        String  district,
        String  destination,
        String  location,
        String  description,
        Integer numberOfRooms,

        // ── Rooms ──────────────────────────────────────
        List<RoomDetailResponse> rooms,

        // ── Owner Information ──────────────────────────
        String ownerName,
        String ownerEmail,
        String ownerNic,
        String nicImageUrl,
        String nicRearImageUrl,
        String businessRegistrationImageUrl,
        Long   ownerId,

        // ── Contact Information ────────────────────────
        String phoneNumber,
        String hotlineNumber,
        String hotelEmail,
        String hotelContactNumber,

        // ── Amenities ──────────────────────────────────
        List<String> amenities,

        // ── Application Status ─────────────────────────
        String applicationStatus,
        String rejectionReason,
        Boolean isActive

) {
    // Room detail inner record
    public record RoomDetailResponse(
            String id,
            String name,
            String type,
            Double price,
            String description,
            String imageUrl,
            Boolean availability
    ) {}
}