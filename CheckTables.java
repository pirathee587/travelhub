import java.sql.*;

public class CheckTables {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the database!");
            
            String[] tables = {"users", "payments", "bookings", "hotels", "packages", "agents", "notifications"};
            
            for (String table : tables) {
                try (Statement stmt = conn.createStatement()) {
                    ResultSet rs = stmt.executeQuery("SELECT count(*) FROM " + table);
                    if (rs.next()) {
                        System.out.println("Table [" + table + "] exists. Row count: " + rs.getInt(1));
                    }
                } catch (SQLException e) {
                    System.out.println("Table [" + table + "] DOES NOT EXIST or error: " + e.getMessage());
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
