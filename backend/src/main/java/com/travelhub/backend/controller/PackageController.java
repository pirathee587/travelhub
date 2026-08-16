package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.PackageDetailResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor

public class PackageController {

    private final PackageService packageService;

    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String district) {
        if (district != null && !district.trim().isEmpty()) {
            return ResponseEntity.ok(packageService.getPackagesByDistrict(district));
        }
        if (category != null && !category.equals("all")) {
            return ResponseEntity.ok(packageService.getPackagesByCategory(category));
        }
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getActiveDistricts() {
        return ResponseEntity.ok(packageService.getActiveDistricts());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<PackageResponse>> getTrendingPackages() {
        return ResponseEntity.ok(packageService.getTrendingPackages());
    }

    // ── Chatbot endpoint ───────────────────────────────────────────────────
    // GET /api/packages/chatbot-data
    // Called by Python AI service on startup and every 5 min to sync ChromaDB
    @GetMapping("/chatbot-data")
    public ResponseEntity<List<Map<String, Object>>> getPackagesForChatbot() {
        return ResponseEntity.ok(packageService.getAllPackagesForChatbot());
    }

    // GET /api/packages/chatbot-search?keyword=Matale
    // Called by Python AI service for real-time, exact package lookups
    @GetMapping("/chatbot-search")
    public ResponseEntity<List<Map<String, Object>>> searchPackagesForChatbot(
            @RequestParam String keyword) {
        return ResponseEntity.ok(packageService.searchPackagesForChatbot(keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackageDetailResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }
}
