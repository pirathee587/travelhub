package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.AdminReportStatusUpdateDto;
import com.travelhub.backend.dto.response.PackageReportResponseDto;
import com.travelhub.backend.service.PackageReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPackageReportController {

    private final PackageReportService packageReportService;

    @GetMapping
    public ResponseEntity<List<PackageReportResponseDto>> getAllReports() {
        return ResponseEntity.ok(packageReportService.getAllReportsForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageReportResponseDto> getReportById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(packageReportService.getReportDetailsForAdmin(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PackageReportResponseDto> updateReportStatus(
            @PathVariable("id") Long id,
            @RequestBody @Valid AdminReportStatusUpdateDto dto
    ) {
        return ResponseEntity.ok(packageReportService.updateReportStatusByAdmin(id, dto));
    }
}
