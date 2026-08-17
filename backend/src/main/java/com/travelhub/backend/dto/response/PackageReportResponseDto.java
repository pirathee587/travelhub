package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageReportResponseDto {

    private Long id;
    private Long bookingId;
    private String bookingStatus;

    private Long userId;
    private String userName;
    private String userEmail;

    private Long packageId;
    private String packageName;
    private String packageLocation;

    private Long agentId;
    private String agentName;
    private String agentEmail;

    private String category;
    private String title;
    private String description;
    private List<String> evidenceUrls;

    private String status;
    private String adminNotes;   // Included ONLY for Admin
    private String resolution;   // Visible to Tourist & Admin

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
