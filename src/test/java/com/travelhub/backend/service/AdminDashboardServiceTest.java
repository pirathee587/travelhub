package com.travelhub.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.travelhub.backend.dto.response.AdminDashboardResponse;

@SpringBootTest
public class AdminDashboardServiceTest {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Test
    public void testGetDashboardStats() {
        try {
            System.out.println("=== RUNNING DASHBOARD DIAGNOSTIC TEST ===");
            AdminDashboardResponse stats = adminDashboardService.getDashboardStats();
            System.out.println("Stats loaded successfully: " + stats);
        } catch (Exception e) {
            System.err.println("=== DASHBOARD DIAGNOSTIC TEST FAILED ===");
            e.printStackTrace();
            throw e;
        }
    }
}
