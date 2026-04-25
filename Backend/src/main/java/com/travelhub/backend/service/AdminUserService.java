package com.travelhub.backend.service;



import com.travelhub.backend.dto.response.AdminUserResponse;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    // ⚠️ Thanushiyan users table create செய்த பிறகு
    // இந்த queries வேலை செய்யும்
    private final JdbcTemplate jdbcTemplate;

    // ── Get All Users ─────────────────────────────────────────
    public List<AdminUserResponse> getAllUsers() {
        String sql = """
                SELECT id, name, email, role, phone,
                       is_active, agent_approved, created_at
                FROM users
                ORDER BY created_at DESC
                """;
        return jdbcTemplate.query(sql, this::mapRow);
    }

    // ── Get Users By Role ─────────────────────────────────────
    public List<AdminUserResponse> getUsersByRole(String role) {
        String sql = """
                SELECT id, name, email, role, phone,
                       is_active, agent_approved, created_at
                FROM users
                WHERE role = ?
                ORDER BY created_at DESC
                """;
        return jdbcTemplate.query(sql, this::mapRow,
                role.toUpperCase());
    }

    // ── Get User By ID ────────────────────────────────────────
    public AdminUserResponse getUserById(Long id) {
        String sql = """
                SELECT id, name, email, role, phone,
                       is_active, agent_approved, created_at
                FROM users
                WHERE id = ?
                """;
        List<AdminUserResponse> result =
                jdbcTemplate.query(sql, this::mapRow, id);
        if (result.isEmpty())
            throw new ResourceNotFoundException("User", "id", id);
        return result.get(0);
    }

    // ── Search Users ──────────────────────────────────────────
    public List<AdminUserResponse> searchUsers(String keyword) {
        String sql = """
                SELECT id, name, email, role, phone,
                       is_active, agent_approved, created_at
                FROM users
                WHERE LOWER(name) LIKE ?
                   OR LOWER(email) LIKE ?
                """;
        String k = "%" + keyword.toLowerCase() + "%";
        return jdbcTemplate.query(sql, this::mapRow, k, k);
    }

    // ── Get Pending Agents ────────────────────────────────────
    public List<AdminUserResponse> getPendingAgents() {
        String sql = """
                SELECT id, name, email, role, phone,
                       is_active, agent_approved, created_at
                FROM users
                WHERE role = 'AGENT'
                  AND agent_approved = false
                """;
        return jdbcTemplate.query(sql, this::mapRow);
    }

    // ── Toggle User Active / Block ────────────────────────────
    public AdminUserResponse toggleUserActive(Long id) {
        AdminUserResponse user = getUserById(id);
        if (user.role().equals("ADMIN"))
            throw new BadRequestException(
                    "Admin-ஐ block செய்ய முடியாது");
        boolean newStatus = !user.isActive();
        jdbcTemplate.update(
                "UPDATE users SET is_active = ? WHERE id = ?",
                newStatus, id);
        return getUserById(id);
    }

    // ── Approve Agent ─────────────────────────────────────────
    public AdminUserResponse approveAgent(Long id) {
        AdminUserResponse user = getUserById(id);
        if (!user.role().equals("AGENT"))
            throw new BadRequestException("இவர் Agent இல்லை");
        jdbcTemplate.update(
                "UPDATE users SET agent_approved = true WHERE id = ?",
                id);
        return getUserById(id);
    }

    // ── Delete User ───────────────────────────────────────────
    public void deleteUser(Long id) {
        AdminUserResponse user = getUserById(id);
        if (user.role().equals("ADMIN"))
            throw new BadRequestException(
                    "Admin-ஐ delete செய்ய முடியாது");
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
    }

    // ── Helper: Map Row ───────────────────────────────────────
    private AdminUserResponse mapRow(ResultSet rs, int rowNum)
            throws SQLException {
        return new AdminUserResponse(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("role"),
                rs.getString("phone"),
                rs.getBoolean("is_active"),
                rs.getBoolean("agent_approved"),
                rs.getString("created_at")
        );
    }
}