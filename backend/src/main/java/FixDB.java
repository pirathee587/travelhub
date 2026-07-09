import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;

public class FixDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0&sslmode=require";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Cleaning flyway failed migration...");
            stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version='9'");

            ResultSet rs = stmt.executeQuery("SELECT user_id FROM agents WHERE user_id IS NOT NULL LIMIT 1");
            if (rs.next()) {
                int validUserId = rs.getInt(1);
                System.out.println("Using valid user_id: " + validUserId);
                stmt.executeUpdate("UPDATE packages SET agent_id = " + validUserId + " WHERE agent_id NOT IN (SELECT user_id FROM agents WHERE user_id IS NOT NULL)");
            } else {
                System.out.println("No valid user_id found in agents table.");
            }
            
            System.out.println("Done!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
