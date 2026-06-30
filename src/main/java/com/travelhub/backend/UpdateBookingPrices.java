package com.travelhub.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class UpdateBookingPrices {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            // Update the total_price in bookings to match the price from the packages table
            // For simplicity, we just set total_price = package.price. If you need to multiply by adults, you could do that too.
            // But since the request is "find a number according to the package and change here as well", 
            // updating total_price to be the exact package price is the most direct way to fix it.
            String updateSQL = "UPDATE bookings SET total_price = p.price_from FROM packages p WHERE bookings.package_id = p.id AND bookings.user_id = 56";
            
            try (PreparedStatement pstmt = conn.prepareStatement(updateSQL)) {
                int rowsAffected = pstmt.executeUpdate();
                System.out.println("Successfully updated prices for " + rowsAffected + " sample bookings!");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
