package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.District;

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
    private District district;
    private String duration;
    private Double priceFrom;
    private Double priceTo;
    private Boolean isActive;
    private Boolean trending;
    private String coverImageUrl;
    private LocalDateTime createdAt;
}