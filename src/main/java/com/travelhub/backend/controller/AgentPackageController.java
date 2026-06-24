package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.UpdatePackageStatusRequest;
import com.travelhub.backend.dto.response.AgentPackageDetailResponse;
import com.travelhub.backend.dto.response.PackageSummaryResponse;
import com.travelhub.backend.service.AgentPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agent/{agentId}/packages")
@RequiredArgsConstructor

public class AgentPackageController {

    private final AgentPackageService packageService;

    // GET /api/v1/agent/{agentId}/packages
    @GetMapping
    public ResponseEntity<List<PackageSummaryResponse>> listPackages(
            @PathVariable Long agentId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {

        return ResponseEntity.ok(packageService.listPackages(agentId, search, isActive));
    }

    // GET /api/v1/agent/{agentId}/packages/{packageId}
    @GetMapping("/{packageId}")
    public ResponseEntity<AgentPackageDetailResponse> getPackage(
            @PathVariable Long agentId,
            @PathVariable String packageId) {

        return ResponseEntity.ok(packageService.getPackage(agentId, packageId));
    }

    // POST /api/v1/agent/{agentId}/packages
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentPackageDetailResponse> createPackage(
            @PathVariable Long agentId,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(packageService.createPackage(agentId, dataJson, images));
    }

    // PUT /api/v1/agent/{agentId}/packages/{packageId}
    @PutMapping(value = "/{packageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentPackageDetailResponse> updatePackage(
            @PathVariable Long agentId,
            @PathVariable String packageId,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        return ResponseEntity.ok(packageService.updatePackage(agentId, packageId, dataJson, images));
    }

    // PATCH /api/v1/agent/{agentId}/packages/{packageId}/status
    @PatchMapping("/{packageId}/status")
    public ResponseEntity<PackageSummaryResponse> updateStatus(
            @PathVariable Long agentId,
            @PathVariable String packageId,
            @Valid @RequestBody UpdatePackageStatusRequest req) {

        return ResponseEntity.ok(packageService.updateStatus(agentId, packageId, req));
    }

    // DELETE /api/v1/agent/{agentId}/packages/{packageId}
    @DeleteMapping("/{packageId}")
    public ResponseEntity<Void> deletePackage(
            @PathVariable Long agentId,
            @PathVariable String packageId) {

        packageService.deletePackage(agentId, packageId);
        return ResponseEntity.noContent().build();
    }
}