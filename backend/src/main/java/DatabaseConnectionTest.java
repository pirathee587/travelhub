import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionTest implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Testing connection to Supabase...");

        try {
            Integer totalHotels = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hotels", Integer.class);
            Integer totalRooms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rooms", Integer.class);
            Integer nullHotelIds = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rooms WHERE hotel_id IS NULL", Integer.class);
            Integer orphanRooms = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rooms r LEFT JOIN hotels h ON h.id = r.hotel_id WHERE r.hotel_id IS NOT NULL AND h.id IS NULL",
                Integer.class);

            System.out.println("📊 Total hotels: " + totalHotels);
            System.out.println("📊 Total rooms: " + totalRooms);
            System.out.println("📊 Rooms with NULL hotel_id: " + nullHotelIds);
            System.out.println("📊 Rooms with missing parent hotel: " + orphanRooms);

            String typeSql = "SELECT data_type FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'hotel_id'";
            String hotelIdType = jdbcTemplate.queryForObject(typeSql, String.class);
            String hotelPkType = jdbcTemplate.queryForObject(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'id'",
                String.class);
            System.out.println("🔎 rooms.hotel_id type: " + hotelIdType);
            System.out.println("🔎 hotels.id type: " + hotelPkType);

            System.out.println("🔍 Sample room-to-hotel mappings:");
            jdbcTemplate.query(
                "SELECT r.id, r.name, r.hotel_id, h.hotel_name FROM rooms r LEFT JOIN hotels h ON h.id = r.hotel_id ORDER BY r.id LIMIT 5",
                rs -> {
                System.out.println("   - RoomID: " + rs.getString("id")
                    + ", Room: " + rs.getString("name")
                    + ", HotelID: " + rs.getObject("hotel_id")
                    + ", HotelName: " + rs.getString("hotel_name"));
                });

            System.out.println("✅ DATABASE DATA CHECK COMPLETE!");

        } catch (Exception e) {
            System.err.println("❌ CONNECTION FAILED!");
            System.err.println("Error details: " + e.getMessage());
            System.err.println("👉 Check if your password is correct in application.properties");
        }
    }
}
