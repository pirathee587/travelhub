package com.travelhub.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class ConnectionCheckConfig {

    @Bean
    public CommandLineRunner checkConnection(JdbcTemplate jdbcTemplate) {
        return args -> {
            System.out.println("\n" + "=".repeat(50));
            System.out.println("[CONNECTION CHECK] Starting verification...");

            // 1. PostgreSQL Check
            try {
                Connection connection = jdbcTemplate.getDataSource().getConnection();
                if (connection != null && !connection.isClosed()) {
                    System.out.println("[SUCCESS] PostgreSQL: Connected to Supabase!");
                    System.out.println("          Database: " + connection.getCatalog());
                    connection.close();
                }
            } catch (Exception e) {
                System.err.println("[FAILED]  PostgreSQL: " + e.getMessage());
                System.err.println("          Tip: Check if your IP is allowed in Supabase or if the DB is paused.");
            }

            System.out.println("=".repeat(50) + "\n");
        };
    }
}
