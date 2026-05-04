package com.travelhub.backend.dto.response;

import java.util.List;

public record AdminHotelDetailResponse(

        // ── Basic ──────────────────────────────────────
        Long   id,
        String hotelName,
        Double rating,
        String imageUrl,

        // ── Location Details ───────────────────────────
        String  district,
        String  location,

        // Room Types list
        List<RoomTypeResponse> roomTypes,

        // ── Owner Information ──────────────────────────
        String ownerName,
        String ownerEmail,
        String ownerNic,
        String nicImageUrl,
        Long   ownerId,

        // ── Contact Information ────────────────────────
        String phoneNumber,
        String hotlineNumber,
        String hotelEmail,
        String hotelContactNumber,

        // ── Amenities ──────────────────────────────────

        List<String> amenities,

        // ── Application Status ─────────────────────────
        // Pending, Approved, Rejected
        String applicationStatus

) {
    // Room type inner record
    public record RoomTypeResponse(
            String name,
            String description
    ) {}
}