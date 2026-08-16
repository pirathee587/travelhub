package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.PackageReportRequestDto;
import com.travelhub.backend.dto.response.PackageReportResponseDto;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.service.PackageReportService;
import com.travelhub.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tourist/reports")
@RequiredArgsConstructor
public class PackageReportController {

    private final PackageReportService packageReportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PackageReportResponseDto> createReport(
            @RequestParam("bookingId") Long bookingId,
            @RequestPart("data") @Valid PackageReportRequestDto dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        Long userId = requireUserId();
        PackageReportResponseDto response = packageReportService.createReport(userId, bookingId, dto, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PackageReportResponseDto>> getMyReports() {
        Long userId = requireUserId();
        return ResponseEntity.ok(packageReportService.getTouristReports(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageReportResponseDto> getMyReportById(@PathVariable("id") Long id) {
        Long userId = requireUserId();
        return ResponseEntity.ok(packageReportService.getTouristReportById(userId, id));
    }

    private Long requireUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
