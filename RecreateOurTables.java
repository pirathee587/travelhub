import java.sql.*;

public class RecreateOurTables {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
        // Wait, I saw a different URL in RepairUsers. Let's use that.
        url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        String createPaymentsSql = "CREATE TABLE IF NOT EXISTS payments (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "transaction_id VARCHAR(255) NOT NULL UNIQUE, " +
                "booking_id BIGINT NOT NULL, " +
                "user_id BIGINT NOT NULL, " +
                "agent_id BIGINT, " +
                "type VARCHAR(50) NOT NULL, " +
                "amount DOUBLE PRECISION NOT NULL, " +
                "status VARCHAR(50) NOT NULL, " +
                "payhere_amount DOUBLE PRECISION, " +
                "payhere_currency VARCHAR(10), " +
                "method VARCHAR(50), " +
                "status_code INTEGER, " +
                "md5sig VARCHAR(255), " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";

        String createNotificationsSql = "CREATE TABLE IF NOT EXISTS notifications (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "agent_id BIGINT NOT NULL, " +
                "type VARCHAR(50) NOT NULL, " +
                "title VARCHAR(255) NOT NULL, " +
                "message TEXT, " +
                "read BOOLEAN DEFAULT FALSE, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Connected to the database!");
            
            System.out.println("Creating payments table...");
            stmt.execute(createPaymentsSql);
            System.out.println("Payments table ready!");

            System.out.println("Creating notifications table...");
            stmt.execute(createNotificationsSql);
            System.out.println("Notifications table ready!");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
