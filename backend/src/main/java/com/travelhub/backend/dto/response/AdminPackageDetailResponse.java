package com.travelhub.backend.dto.response;

import java.util.List;

public record AdminPackageDetailResponse(

        // ── Basic Info ─────────────────────────────────
        Long   id,
        String packageId,
        String packageName,
        String destination,
        String district,
        String startPlace,
        String endPlace,
        String packageType,

        // ── Price ──────────────────────────────────────
        Double priceFrom,
        Double priceTo,
        Double basePriceAdult,
        Double basePriceChild,

        // ── Gallery ────────────────────────────────────
        List<String> images,
        String imageUrl,

        // ── Info Cards ─────────────────────────────────
        String duration,
        String providerName,
        String applicationStatus,

        // ── Description & Details ──────────────────────
        String description,
        String festivalDetails,

        // ── What's Included ────────────────────────────
        List<String> inclusions,

        // ── Itinerary — Day by Day ─────────────────────
        List<ItineraryDayDetail> itinerary,

        // ── Extra Info ─────────────────────────────────
        Double  rating,
        Integer reviewCount,
        String  category,
        Boolean trending,
        Boolean isActive,
        Long    bookings

) {
    // Activity detail record
    public record ActivityDetail(
            String description,
            String imageUrl
    ) {}

    // Itinerary Day inner record
    public record ItineraryDayDetail(
            Long    dayId,
            Integer dayNumber,
            String  title,
            String  description,
            List<ActivityDetail> activities,
            String  district,
            Long    hotelId,
            String  hotelName,
            String  hotelImageUrl
    ) {}
}