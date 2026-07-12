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



    @Size(max = 2000)
    private String description;

    private Boolean isActive = true;



    // ── Package type & per-person pricing ─────────────────────
    private String packageType;       // "SINGLE_DISTRICT" or "MULTI_DISTRICT"
    private Double basePriceAdult;    // price per adult
    private Double basePriceChild;    // price per child

    private List<String> inclusions;


    // For PUT — existing image URLs to keep (omit to delete)
    private List<String> existingImageUrls;

    @Valid
    private List<PackageDayRequest> days;
}