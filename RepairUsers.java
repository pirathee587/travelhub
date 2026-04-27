import java.sql.*;

public class RepairUsers {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.gzkohtgqtpbscczxuaaj";
        String password = "TJHPE@B23UOM";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the database!");

            repairUser(conn, "saras69wathy+agent@gmail.com", "AGENT");
            repairUser(conn, "saras69wathy+hotel@gmail.com", "HOTEL_OWNER");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static void repairUser(Connection conn, String email, String role) throws SQLException {
        System.out.println("Checking user: " + email);
        String selectUser = "SELECT id, agent_id, hotel_id, name, district, agency_name, hotel_name FROM users WHERE email = ?";
        
        long userId = -1;
        Long agentId = null;
        Long hotelId = null;
        String name = "";
        String district = "";
        String agencyName = "";
        String hotelName = "";

        try (PreparedStatement pstmt = conn.prepareStatement(selectUser)) {
            pstmt.setString(1, email);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                userId = rs.getLong("id");
                agentId = rs.getObject("agent_id") != null ? rs.getLong("agent_id") : null;
                hotelId = rs.getObject("hotel_id") != null ? rs.getLong("hotel_id") : null;
                name = rs.getString("name");
                district = rs.getString("district");
                agencyName = rs.getString("agency_name");
                hotelName = rs.getString("hotel_name");
                System.out.println("User found. ID: " + userId + ", agent_id: " + agentId + ", hotel_id: " + hotelId);
            } else {
                System.out.println("User not found: " + email);
                return;
            }
        }

        if (role.equals("AGENT") && agentId == null) {
            // Check if agent record exists by email
            String selectAgent = "SELECT id FROM agents WHERE email = ?";
            try (PreparedStatement pstmt = conn.prepareStatement(selectAgent)) {
                pstmt.setString(1, email);
                ResultSet rs = pstmt.executeQuery();
                if (rs.next()) {
                    agentId = rs.getLong("id");
                    System.out.println("Existing agent found with ID: " + agentId);
                } else {
                    // Create new agent
                    String insertAgent = "INSERT INTO agents (agent_name, email, agency_name, is_active) VALUES (?, ?, ?, true) RETURNING id";
                    try (PreparedStatement ipstmt = conn.prepareStatement(insertAgent)) {
                        ipstmt.setString(1, name);
                        ipstmt.setString(2, email);
                        ipstmt.setString(3, agencyName != null ? agencyName : name + "'s Agency");
                        ResultSet irs = ipstmt.executeQuery();
                        if (irs.next()) {
                            agentId = irs.getLong("id");
                            System.out.println("New agent created with ID: " + agentId);
                        }
                    }
                }
            }
            if (agentId != null) {
                String updateUser = "UPDATE users SET agent_id = ? WHERE id = ?";
                try (PreparedStatement upstmt = conn.prepareStatement(updateUser)) {
                    upstmt.setLong(1, agentId);
                    upstmt.setLong(2, userId);
                    upstmt.executeUpdate();
                    System.out.println("User updated with agent_id: " + agentId);
                }
            }
        } else if (role.equals("HOTEL_OWNER") && hotelId == null) {
             // Check if hotel record exists? (Harder as hotels don't have email usually in this schema, but let's check by name)
             // For simplicity, let's just create one or check if there is one with a similar name
             String insertHotel = "INSERT INTO hotels (hotel_name, district) VALUES (?, ?) RETURNING id";
             try (PreparedStatement ipstmt = conn.prepareStatement(insertHotel)) {
                 ipstmt.setString(1, hotelName != null ? hotelName : name + "'s Hotel");
                 ipstmt.setString(2, district != null ? district : "Unknown");
                 ResultSet irs = ipstmt.executeQuery();
                 if (irs.next()) {
                     hotelId = irs.getLong("id");
                     System.out.println("New hotel created with ID: " + hotelId);
                 }
             }
             if (hotelId != null) {
                String updateUser = "UPDATE users SET hotel_id = ? WHERE id = ?";
                try (PreparedStatement upstmt = conn.prepareStatement(updateUser)) {
                    upstmt.setLong(1, hotelId);
                    upstmt.setLong(2, userId);
                    upstmt.executeUpdate();
                    System.out.println("User updated with hotel_id: " + hotelId);
                }
            }
        } else {
            System.out.println("User already has linked ID or role mismatch.");
        }
    }
}
