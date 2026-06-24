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
            @RequestParam(required = false) String category) {
        if (category != null && !category.equals("all")) {
            return ResponseEntity.ok(packageService.getPackagesByCategory(category));
        }
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

    // ── Chatbot endpoint ───────────────────────────────────────────────────
    // GET /api/packages/chatbot-data
    // Called by Python AI service on startup and every 30 min to sync ChromaDB
    @GetMapping("/chatbot-data")
    public ResponseEntity<List<Map<String, Object>>> getPackagesForChatbot() {
    return ResponseEntity.ok(packageService.getAllPackagesForChatbot());
    }
}
