package com.travelhub.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;


import java.util.List;

// ── CreatePackageRequest ────────────────────────────────────────────────────
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePackageRequest {

    @NotBlank(message = "Package name is required")
    @Size(min = 3, max = 200, message = "Name must be 3–200 characters")
    private String name;

    @NotBlank(message = "Category is required")
    private String category; // CULTURE, BEACH, MOUNTAIN, CITY, WILDLIFE

    @NotBlank(message = "Destination is required")
    @Size(max = 200)
    private String destination;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Start place is required")
    @Size(max = 200)
    private String startPlace;

    @NotBlank(message = "End place is required")
    @Size(max = 200)
    private String endPlace;

    @NotBlank(message = "Duration is required")
    @Size(max = 50)
    private String duration;

    @NotNull(message = "Price from is required")

    private Double priceFrom;

    @NotNull(message = "Price to is required")
    private Double priceTo;

    @Size(max = 2000)
    private String description;

    @Size(max = 1000)
    private String festivalDetails;

    private Boolean isActive = true;

    private Boolean trending = false;

    // For PUT — existing image URLs to keep (omit to delete)
    private List<String> existingImageUrls;

    @Valid
    private List<PackageDayRequest> days;
}