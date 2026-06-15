package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.PackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * PackageController manages the public-facing travel package discovery endpoints.
 * It provides tools for searching, filtering, and viewing detailed itineraries for tourists.
 */
@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
public class PackageController {

    private final PackageService packageService;

    /**
     * Constructor injection for package retrieval business logic.
     */
    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    /**
     * Retrieves a list of available travel packages.
     * Supports optional filtering by travel category (e.g., 'Adventure', 'Cultural').
     * If category is 'all' or null, returns the full inventory.
     */
    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages(
            @RequestParam(required = false) String category) {
        if (category != null && !category.equals("all")) {
            return ResponseEntity.ok(packageService.getPackagesByCategory(category));
        }
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    /**
     * Retrieves the most popular travel packages based on current user engagement and bookings.
     */
    @GetMapping("/trending")
    public ResponseEntity<List<PackageResponse>> getTrendingPackages() {
        return ResponseEntity.ok(packageService.getTrendingPackages());
    }

    /**
     * Retrieves comprehensive information for a single travel package by its ID.
     * Includes detailed itineraries, multimedia galleries, and property information.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PackageDetailResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }
}
