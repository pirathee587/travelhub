package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminPackageResponse;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPackageService {

    private final PackageRepository packageRepository;

    // ── Get All Packages ──────────────────────────────
    public List<AdminPackageResponse> getAllPackages() {
        return packageRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Package By ID ─────────────────────────────
    public AdminPackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));
        return mapToResponse(pkg);
    }

    // ── Toggle Package Active ─────────────────────────
    public AdminPackageResponse togglePackageActive(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));
        pkg.setIsActive(!pkg.getIsActive());
        return mapToResponse(packageRepository.save(pkg));
    }

    // ── Delete Package ────────────────────────────────
    public void deletePackage(Long id) {
        packageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Package", "id", id));
        packageRepository.deleteById(id);
    }

    // ── Map Entity to Response ────────────────────────
    private AdminPackageResponse mapToResponse(Package p) {
        return new AdminPackageResponse(
                p.getId(),
                p.getPackageName(),
                p.getDestination(),
                p.getPriceFrom(),
                p.getPriceTo(),
                p.getDuration(),
                p.getCategory(),
                p.getRating(),
                p.getReviewCount(),
                p.getTrending(),
                p.getIsActive(),
                p.getAgent() != null
                        ? p.getAgent().getAgentName()
                        : ""
        );
    }
}