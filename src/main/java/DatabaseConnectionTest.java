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
            // This simple query asks the database for the current time
            String sql = "SELECT now()";
            String currentTime = jdbcTemplate.queryForObject(sql, String.class);

            System.out.println("✅ CONNECTION SUCCESSFUL!");
            System.out.println("📅 Supabase Server Time: " + currentTime);
            System.out.println("👥 Your team of 5 is now connected to the same cloud DB.");

        } catch (Exception e) {
            System.err.println("❌ CONNECTION FAILED!");
            System.err.println("Error details: " + e.getMessage());
            System.err.println("👉 Check if your password is correct in application.properties");
        }
    }
}
