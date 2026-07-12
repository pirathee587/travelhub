package com.travelhub.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PackageDayRequest {

    @NotNull(message = "Day number is required")
    @Min(value = 1, message = "Day number must be >= 1")
    private Integer dayNumber;

    @NotBlank(message = "Day title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    // Activities stored as serialized JSON array of objects
    private List<PackageActivityRequest> activities;

    // ── Multi-district fields ─────────────────────────────────
    private String district;          // which district for this day
    private Long hotelId;             // FK to hotel (if in DB), nullable
    private String hotelNameCustom;   // free text hotel name (if not in DB), nullable

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PackageActivityRequest {
        private String description;
        private String imageUrl;
    }
}