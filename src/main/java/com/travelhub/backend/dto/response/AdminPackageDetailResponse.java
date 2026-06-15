package com.travelhub.backend.dto.response;

import java.util.List;

public record AdminPackageDetailResponse(

        // ── Basic Info ─────────────────────────────────
        Long   id,
        String packageName,
        String destination,
        String district,

        // ── Price ──────────────────────────────────────
        // Frontend-ல் $450 per person
        Double priceFrom,
        Double priceTo,

        // ── Gallery ────────────────────────────────────
        // Multiple images — 1/3, 2/3, 3/3
        List<String> images,
        String imageUrl,

        // ── Info Cards ─────────────────────────────────
        // Duration card — "3 Days / 2 Nights"
        String duration,

        // Provider card — "Pinnacle Tours"
        String providerName,

        // Status card — "Pending"
        String applicationStatus,

        // ── Description ────────────────────────────────
        String description,

        // ── What's Included ────────────────────────────
        // [Accommodation, Meals, Transportation,
        //  Guide, Entry fees]
        List<String> inclusions,

        // ── Itinerary — Day by Day ─────────────────────
        List<ItineraryDayDetail> itinerary,

        // ── Extra Info ─────────────────────────────────
        Double  rating,
        Integer reviewCount,
        String  category,
        Boolean trending,
        Boolean isActive

) {
    // Itinerary Day inner record
    public record ItineraryDayDetail(
            Integer dayNumber,
            String  title,
            String  description,
            List<String> activities
    ) {}
}