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

    // Activities stored as simple string list — joined with ", " before saving
    private List<String> activities;
}