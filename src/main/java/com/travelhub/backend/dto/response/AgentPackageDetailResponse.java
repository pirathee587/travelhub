package com.travelhub.backend.dto.response;

import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AgentPackageDetailResponse {
    private String packageId;
    private String name;
    private String category;
    private String destination;
    private String district;
    private String startPlace;
    private String endPlace;
    private String duration;
    private Double priceFrom;
    private Double priceTo;
    private String description;
    private String festivalDetails;
    private Boolean isActive;
    private Boolean trending;
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
        private List<String> activities;
    }
}