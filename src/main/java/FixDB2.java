import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDB2 {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0&sslmode=require";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Dropping bad constraint...");
            try {
                stmt.executeUpdate("ALTER TABLE packages DROP CONSTRAINT IF EXISTS fkndkpxcrr6ofhh65429hcteer8");
            } catch (Exception e) {
                System.out.println("Drop constraint failed: " + e.getMessage());
            }

            System.out.println("Updating agent_id to use actual agents.id...");
            stmt.executeUpdate("UPDATE packages SET agent_id = (SELECT MIN(id) FROM agents) WHERE agent_id NOT IN (SELECT id FROM agents)");

            System.out.println("Adding proper constraint...");
            stmt.executeUpdate("ALTER TABLE packages ADD CONSTRAINT fk_packages_agent FOREIGN KEY (agent_id) REFERENCES agents(id)");
            
            System.out.println("Done!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
