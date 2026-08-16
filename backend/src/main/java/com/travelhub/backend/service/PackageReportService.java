package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.AdminReportStatusUpdateDto;
import com.travelhub.backend.dto.request.PackageReportRequestDto;
import com.travelhub.backend.dto.response.PackageReportResponseDto;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PackageReportRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackageReportService {

    private final PackageReportRepository packageReportRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;
    private final UserNotificationService userNotificationService;

    @Transactional
    public PackageReportResponseDto createReport(Long userId, Long bookingId, PackageReportRequestDto dto, List<MultipartFile> files) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        // Step 1: Verify Ownership
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access: This booking does not belong to you");
        }

        // Step 2: Verify Completed Status
        String bookingStatus = booking.getStatus() != null ? booking.getStatus().toLowerCase() : "";
        if (!"completed".equalsIgnoreCase(bookingStatus)) {
            throw new BadRequestException("Only completed packages can be reported");
        }

        // Step 3: Duplicate Active Report Protection
        boolean hasActiveReport = packageReportRepository.existsByUserIdAndBookingIdAndStatusIn(
                userId, bookingId, List.of("OPEN", "UNDER_REVIEW")
        );
        if (hasActiveReport) {
            throw new BadRequestException("An active report for this booking is already under investigation");
        }

        // Step 4: Extract Package and Agent
        Package pkg = booking.getPkg();
        if (pkg == null) {
            throw new BadRequestException("No package linked to this booking");
        }
        Agent agent = pkg.getAgent();
        if (agent == null) {
            throw new BadRequestException("No travel agency associated with this package");
        }

        // Step 5: Build & Save Initial Report
        PackageReport report = PackageReport.builder()
                .booking(booking)
                .user(booking.getUser())
                .pkg(pkg)
                .agent(agent)
                .category(dto.getCategory().toUpperCase())
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .status("OPEN")
                .evidenceList(new ArrayList<>())
                .build();

        PackageReport savedReport = packageReportRepository.save(report);

        // Step 6: Handle Evidence Uploads
        log.info("Received {} evidence files for booking report #{}", files != null ? files.size() : 0, bookingId);
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = imageUploadService.uploadReportImage(file).getImageUrl();
                        log.info("Successfully uploaded evidence image: {}", imageUrl);
                        PackageReportEvidence evidence = PackageReportEvidence.builder()
                                .report(savedReport)
                                .imageUrl(imageUrl)
                                .build();
                        savedReport.getEvidenceList().add(evidence);
                    } catch (Exception e) {
                        log.error("Failed to upload report evidence image: {}", e.getMessage(), e);
                    }
                }
            }
            savedReport = packageReportRepository.save(savedReport);
        }

        // Step 7: Notify Tourist
        try {
            userNotificationService.notifyUser(
                    userId,
                    "report",
                    "Report Submitted",
                    "Your report for booking #" + booking.getId() + " (" + pkg.getPackageName() + ") has been submitted successfully.",
                    "/tourist/reports"
            );
        } catch (Exception e) {
            log.warn("Notification error on report creation: {}", e.getMessage());
        }

        return mapToDto(savedReport, false);
    }

    @Transactional(readOnly = true)
    public List<PackageReportResponseDto> getTouristReports(Long userId) {
        return packageReportRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(r -> mapToDto(r, false)) // Tourist side — exclude admin notes
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PackageReportResponseDto getTouristReportById(Long userId, Long reportId) {
        PackageReport report = packageReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));

        if (!report.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to report");
        }

        return mapToDto(report, false);
    }

    @Transactional(readOnly = true)
    public List<PackageReportResponseDto> getAllReportsForAdmin() {
        return packageReportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> mapToDto(r, true)) // Admin side — include admin notes
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PackageReportResponseDto getReportDetailsForAdmin(Long reportId) {
        PackageReport report = packageReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));

        return mapToDto(report, true);
    }

    @Transactional
    public PackageReportResponseDto updateReportStatusByAdmin(Long reportId, AdminReportStatusUpdateDto dto) {
        PackageReport report = packageReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));

        String newStatus = dto.getStatus().toUpperCase();
        if (!List.of("OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED").contains(newStatus)) {
            throw new BadRequestException("Invalid report status: " + newStatus);
        }

        report.setStatus(newStatus);

        if (dto.getAdminNotes() != null) {
            report.setAdminNotes(dto.getAdminNotes().trim());
        }

        if (dto.getResolution() != null) {
            report.setResolution(dto.getResolution().trim());
        }

        if ("RESOLVED".equals(newStatus) || "REJECTED".equals(newStatus)) {
            report.setResolvedAt(LocalDateTime.now());
        }

        PackageReport updated = packageReportRepository.save(report);

        // Notify Tourist of Status Update
        try {
            String title = "Report Status Update";
            String message = "Your report #" + reportId + " status changed to " + newStatus + ".";
            if ("RESOLVED".equals(newStatus)) {
                title = "Report Resolved";
                message = "Your report #" + reportId + " has been resolved by Admin.";
            } else if ("REJECTED".equals(newStatus)) {
                title = "Report Reviewed";
                message = "Your report #" + reportId + " has been reviewed by Admin.";
            }

            userNotificationService.notifyUser(
                    report.getUser().getId(),
                    "report",
                    title,
                    message,
                    "/tourist/reports"
            );
        } catch (Exception e) {
            log.warn("Failed to send notification for report status update: {}", e.getMessage());
        }

        return mapToDto(updated, true);
    }

    private PackageReportResponseDto mapToDto(PackageReport report, boolean includeAdminNotes) {
        List<String> evidenceUrls = report.getEvidenceList() != null ?
                report.getEvidenceList().stream().map(PackageReportEvidence::getImageUrl).collect(Collectors.toList())
                : List.of();

        return PackageReportResponseDto.builder()
                .id(report.getId())
                .bookingId(report.getBooking() != null ? report.getBooking().getId() : null)
                .bookingStatus(report.getBooking() != null ? report.getBooking().getStatus() : null)
                .userId(report.getUser() != null ? report.getUser().getId() : null)
                .userName(report.getUser() != null ? report.getUser().getName() : null)
                .userEmail(report.getUser() != null ? report.getUser().getEmail() : null)
                .packageId(report.getPkg() != null ? report.getPkg().getId() : null)
                .packageName(report.getPkg() != null ? report.getPkg().getPackageName() : null)
                .packageLocation(report.getPkg() != null ? report.getPkg().getDestination() : null)
                .agentId(report.getAgent() != null ? report.getAgent().getId() : null)
                .agentName(report.getAgent() != null ? report.getAgent().getAgencyName() : null)
                .agentEmail(report.getAgent() != null && report.getAgent().getOwner() != null ? report.getAgent().getOwner().getEmail() : null)
                .category(report.getCategory())
                .title(report.getTitle())
                .description(report.getDescription())
                .evidenceUrls(evidenceUrls)
                .status(report.getStatus())
                .adminNotes(includeAdminNotes ? report.getAdminNotes() : null)
                .resolution(report.getResolution())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .resolvedAt(report.getResolvedAt())
                .build();
    }
}
