package com.travelhub.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.PackageRepository;
import java.util.List;

import com.travelhub.backend.repository.UserRepository;

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

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testPrintAllUsers() {
        System.out.println("=== PRINTING USERS ===");
        userRepository.findAll().forEach(u -> {
            System.out.println("User: ID=" + u.getId() + ", Email=" + u.getEmail() + ", Role=" + u.getRole() + ", Active=" + u.getIsActive() + ", Approved=" + u.getAgentApproved());
        });
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Test
    public void resetAdminPassword() {
        var adminOpt = userRepository.findByEmail("jeyakumaranpiratheepan120@gmail.com");
        if (adminOpt.isPresent()) {
            var admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setIsActive(true);
            admin.setEmailVerified(true);
            userRepository.save(admin);
            System.out.println("=== PASSWORD RESET SUCCESSFUL FOR ADMIN ===");
        } else {
            System.out.println("=== ADMIN USER NOT FOUND ===");
        }
    }
}
