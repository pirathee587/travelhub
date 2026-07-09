package com.travelhub.backend.config;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ConnectionCheckConfig {

    @Bean
    public CommandLineRunner checkConnection(JdbcTemplate jdbcTemplate) {
        return args -> {
            System.out.println("\n" + "=".repeat(50));
            System.out.println("[CONNECTION CHECK] Starting room/hotel integrity verification...");

            DataSource dataSource = jdbcTemplate.getDataSource();
            try {
                if (dataSource != null) {
                    try (Connection connection = dataSource.getConnection()) {
                        if (!connection.isClosed()) {
                            System.out.println("[SUCCESS] PostgreSQL: Connected to Supabase!");
                            System.out.println("          Database: " + connection.getCatalog());
                        }
                    }
                }
            } catch (SQLException e) {
                System.err.println("[FAILED]  PostgreSQL: " + e.getMessage());
                System.err.println("          Tip: Check if your IP is allowed in Supabase or if the DB is paused.");
            }

            try {
                Integer totalHotels = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hotels", Integer.class);
                Integer totalRooms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rooms", Integer.class);
                Integer nullHotelIds = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM rooms WHERE hotel_id IS NULL", Integer.class);
                Integer orphanRooms = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM rooms r LEFT JOIN hotels h ON h.id = r.hotel_id WHERE r.hotel_id IS NOT NULL AND h.id IS NULL",
                        Integer.class);

                String roomHotelIdType = jdbcTemplate.queryForObject(
                        "SELECT data_type FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'hotel_id'",
                        String.class);
                String hotelIdType = jdbcTemplate.queryForObject(
                        "SELECT data_type FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'id'",
                        String.class);

                System.out.println("[DB] hotels count: " + totalHotels);
                System.out.println("[DB] rooms count: " + totalRooms);
                System.out.println("[DB] rooms with NULL hotel_id: " + nullHotelIds);
                System.out.println("[DB] rooms with missing parent hotel: " + orphanRooms);
                System.out.println("[DB] rooms.hotel_id type: " + roomHotelIdType);
                System.out.println("[DB] hotels.id type: " + hotelIdType);

                System.out.println("[DB] sample room-to-hotel rows:");
                jdbcTemplate.query(
                        "SELECT r.id, r.name, r.hotel_id, h.hotel_name FROM rooms r LEFT JOIN hotels h ON h.id = r.hotel_id ORDER BY r.id LIMIT 5",
                        (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                            try {
                                System.out.println(
                                        "   - room_id=" + rs.getString("id")
                                                + ", room_name=" + rs.getString("name")
                                                + ", hotel_id=" + rs.getObject("hotel_id")
                                                + ", hotel_name=" + rs.getString("hotel_name"));
                            } catch (SQLException e) {
                                throw new RuntimeException(e);
                            }
                        });
            } catch (RuntimeException e) {
                System.err.println("[FAILED]  Room/hotel integrity check: " + e.getMessage());
            }

            System.out.println("=".repeat(50) + "\n");
        };
    }
}
