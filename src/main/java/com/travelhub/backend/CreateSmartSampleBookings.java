package com.travelhub.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

public class CreateSmartSampleBookings {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            Long agentId = 5L;
            Long userId = 56L;

            // 1. Delete previous sample bookings for this user to start fresh
            stmt.executeUpdate("DELETE FROM bookings WHERE user_id = " + userId);
            System.out.println("Deleted old sample bookings for user " + userId);

            // 2. Fetch 5 different packages for Agent 5 (excluding Vavuniya tour if possible, but limit 5 should naturally pick others)
            List<Long> packageIds = new ArrayList<>();
            ResultSet rs = stmt.executeQuery("SELECT id FROM packages WHERE agent_id = " + agentId + " ORDER BY id DESC LIMIT 5");
            while (rs.next()) {
                packageIds.add(rs.getLong("id"));
            }

            if (packageIds.isEmpty()) {
                System.out.println("No packages found for agent " + agentId);
                return;
            }

            // Fallback if less than 5 packages
            while (packageIds.size() < 5) {
                packageIds.add(packageIds.get(0));
            }

            // 3. Get a vehicle for Agent 5
            Long vehicleId = null;
            rs = stmt.executeQuery("SELECT id FROM vehicles WHERE agent_id = " + agentId + " LIMIT 1");
            if (rs.next()) {
                vehicleId = rs.getLong("id");
            } else {
                rs = stmt.executeQuery("SELECT id FROM vehicles LIMIT 1");
                if (rs.next()) vehicleId = rs.getLong("id");
            }

            String insertSQL = "INSERT INTO bookings (user_id, package_id, vehicle_id, status, start_date, end_date, total_price, progress, adults, children, duration, created_at) " +
                               "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            try (PreparedStatement pstmt = conn.prepareStatement(insertSQL)) {
                LocalDate today = LocalDate.now();

                // Define scenarios
                String[] statuses = {"pending", "confirmed", "in_progress", "completed", "cancelled"};
                
                for (int i = 0; i < 5; i++) {
                    String status = statuses[i];
                    Long pkgId = packageIds.get(i);
                    LocalDate startDate = today;
                    LocalDate endDate = today;
                    int progress = 0;
                    Long assignedVehicle = vehicleId;

                    if (status.equals("pending")) {
                        startDate = today.plusDays(30);
                        endDate = startDate.plusDays(5);
                        progress = 10;
                        assignedVehicle = null; // Pending usually no vehicle assigned yet
                    } else if (status.equals("confirmed")) {
                        startDate = today.plusDays(10);
                        endDate = startDate.plusDays(5);
                        progress = 30;
                    } else if (status.equals("in_progress")) {
                        startDate = today.minusDays(2);
                        endDate = today.plusDays(3);
                        progress = 60;
                    } else if (status.equals("completed")) {
                        startDate = today.minusDays(20);
                        endDate = today.minusDays(15);
                        progress = 100;
                    } else if (status.equals("cancelled")) {
                        startDate = today.plusDays(20);
                        endDate = startDate.plusDays(5);
                        progress = 0;
                    }

                    pstmt.setLong(1, userId);
                    pstmt.setLong(2, pkgId);
                    if (assignedVehicle != null) {
                        pstmt.setLong(3, assignedVehicle);
                    } else {
                        pstmt.setNull(3, java.sql.Types.BIGINT);
                    }
                    pstmt.setString(4, status);
                    pstmt.setDate(5, Date.valueOf(startDate));
                    pstmt.setDate(6, Date.valueOf(endDate));
                    pstmt.setDouble(7, 1000.0 * (i + 1));
                    pstmt.setInt(8, progress);
                    pstmt.setInt(9, 2);
                    pstmt.setInt(10, 0);
                    pstmt.setString(11, "5 Days");
                    pstmt.setTimestamp(12, Timestamp.valueOf(LocalDateTime.now().minusDays(30))); // booked 30 days ago
                    
                    pstmt.executeUpdate();
                    System.out.println("Inserted " + status + " booking. Pkg: " + pkgId + " | Start: " + startDate + " | End: " + endDate);
                }
            }
            
            System.out.println("Successfully created smart sample bookings!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
