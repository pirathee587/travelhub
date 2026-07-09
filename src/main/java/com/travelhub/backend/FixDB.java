package com.travelhub.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Fixing Flyway and Packages...");
            
            try {
                stmt.execute("DELETE FROM flyway_schema_history WHERE version = '12'");
                System.out.println("Removed V12 from flyway_schema_history");
            } catch (Exception e) {
                System.out.println("Could not delete from flyway_schema_history: " + e.getMessage());
            }

            try {
                stmt.execute("DELETE FROM packages WHERE package_id IN ('PKG-S01', 'PKG-S02', 'PKG-S03', 'PKG-S04', 'PKG-S05', 'PKG-S06', 'PKG-S07', 'PKG-S08')");
                System.out.println("Deleted old international packages");
            } catch (Exception e) {
                System.out.println("Could not delete old packages: " + e.getMessage());
            }

            System.out.println("Done fixing DB.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
