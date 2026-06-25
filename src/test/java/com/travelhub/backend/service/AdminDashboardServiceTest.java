package com.travelhub.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.PackageRepository;
import java.util.List;

@SpringBootTest
public class AdminDashboardServiceTest {

    @Autowired
    private PackageRepository packageRepository;

    @Test
    @org.springframework.transaction.annotation.Transactional
    public void testPrintPackages() {
        System.out.println("=== PRINTING PACKAGES ===");
        List<Package> packages = packageRepository.findAll();
        for (Package p : packages) {
            System.out.println("Package ID: " + p.getId());
            System.out.println("Package Name: " + p.getPackageName());
            System.out.println("Agent ID: " + (p.getAgent() != null ? p.getAgent().getId() : "null"));
            System.out.println("Agent Name: " + (p.getAgent() != null ? p.getAgent().getAgencyName() : "null"));
            System.out.println("imageUrl field: " + p.getImageUrl());
            System.out.println("Images list size: " + (p.getImages() != null ? p.getImages().size() : "null"));
            if (p.getImages() != null) {
                for (var img : p.getImages()) {
                    System.out.println("  - Image ID: " + img.getId() + ", displayOrder: " + img.getDisplayOrder() + ", URL: " + img.getImageUrl());
                }
            }
            System.out.println("Application Status: " + p.getApplicationStatus());
            System.out.println("Deleted At: " + p.getDeletedAt());
            System.out.println("Is Active: " + p.getIsActive());
            System.out.println("---------------------------------");
        }
    }

    @Test
    public void testPendingPackageCount() {
        long pendingCount = packageRepository.countByApplicationStatusAndDeletedAtIsNull("Pending");
        long approvedCount = packageRepository.countByApplicationStatusAndDeletedAtIsNull("Approved");
        System.out.println("=== PACKAGE COUNTS ===");
        System.out.println("Pending packages (not deleted): " + pendingCount);
        System.out.println("Approved packages (not deleted): " + approvedCount);
        System.out.println("Total packages: " + packageRepository.count());
    }
}
