package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:5173", "http://localhost:3000"})
public class PackageController {

    private final PackageService packageService;

    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages(
            @RequestParam(required = false) String category) {
        if (category != null && !category.equals("all")) {
            return ResponseEntity.ok(packageService.getPackagesByCategory(category));
        }
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/chatbot-data")
    public ResponseEntity<List<PackageResponse>> getChatbotData() {
        // Always returns the latest active packages directly from the database.
        // Called by the Python chatbot service on every chat request — no caching.
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<PackageResponse>> getTrendingPackages() {
        return ResponseEntity.ok(packageService.getTrendingPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageDetailResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }
}
