package com.travelhub.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

// ── PackageSummaryResponse (list view) ─────────────────────────────────────
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PackageSummaryResponse {
    private String packageId;
    private String name;
    private String category;
    private String destination;
    private String district;
    private String duration;
    private Double priceFrom;
    private Double priceTo;
    private Double basePriceAdult;
    private Double basePriceChild;
    private Boolean isActive;
    private Boolean trending;
    private String coverImageUrl;
    private LocalDateTime createdAt;
}