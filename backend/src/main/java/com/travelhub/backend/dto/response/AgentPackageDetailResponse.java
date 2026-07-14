package com.travelhub.backend.dto.response;

import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AgentPackageDetailResponse {
    private String packageId;
    private String name;
    private String category;

    private String district;
    private String startPlace;
    private String endPlace;
    private String duration;
    private String packageType;
    private Double basePriceAdult;
    private Double basePriceChild;
    private String description;
    private List<String> inclusions;


    private Boolean isActive;
    private String applicationStatus;

    private List<AgentPackageImageResponse> images;
    private List<AgentPackageDayResponse> days;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Nested: Image ─────────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AgentPackageImageResponse {
        private String imageUrl;
        private Integer displayOrder;
        private String originalFileName;
    }

    // ── Nested: Day ───────────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AgentPackageDayResponse {
        private Long dayId;
        private Integer dayNumber;
        private String title;
        private String description;
        private List<PackageActivityResponse> activities;
        private String district;
        private Long hotelId;
        private String hotelName;
        private String hotelImageUrl;
    }

    // ── Nested: Activity ──────────────────────────────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PackageActivityResponse {
        private String description;
        private String imageUrl;
    }
}