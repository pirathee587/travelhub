package com.travelhub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportStatusUpdateDto {

    @NotBlank(message = "Status is required")
    private String status; // OPEN, UNDER_REVIEW, RESOLVED, REJECTED

    private String adminNotes;

    private String resolution;
}
