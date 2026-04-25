# Change Log - TravelHub Project

This file tracks all modifications made to teammate-owned code or shared configuration files.

| Date | File | Change Description | Author | Rationale |
|------|------|--------------------|--------|-----------|
| 2026-04-25 | `application.properties` | Updated supabase buckets to match team agreement and added Gmail SMTP/JWT configs. | Antigravity | Syncing with team storage agreement and preparing Auth. |
| 2026-04-25 | `SecurityConfig.java` | Implemented JWT-based stateless authentication and RBAC. | Antigravity | Implementing secure Auth module. |

---

## Detailed Change Records

### [Pending] SecurityConfig.java
- **Change**: Implement `SecurityFilterChain` with JWT filter.
- **Impact**: All endpoints will now require authentication unless explicitly permitted.

### [Pending] application.properties
- **Change**: Adding `supabase.bucket=package-images` and `supabase.review-bucket=review-images`.
- **Impact**: Ensures compatibility with teammates' storage services.
