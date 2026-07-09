# Change Log - TravelHub Project

This file tracks all modifications made to teammate-owned code or shared configuration files.

| Date | File | Change Description | Author | Rationale |
|------|------|--------------------|--------|-----------|
| 2026-04-25 | `application.properties` | Updated supabase buckets to match team agreement and added Gmail SMTP/JWT configs. | Antigravity | Syncing with team storage agreement and preparing Auth. |
| 2026-04-25 | `SecurityConfig.java` | Implemented JWT-based stateless authentication and RBAC. | Antigravity | Implementing secure Auth module. |
| 2026-05-04 | `Backend Stabilization` | Integrated Flyway, tracked missing migrations, and removed manual DB fix logic. | Antigravity | Stabilizing repository after major feature merges. |
| 2026-06-25 | `AuthService.java` | Annotated `login` method with `@Transactional`. | Antigravity | Prevents `LazyInitializationException` when loading `User.agencies` for JWT claims. |
| 2026-06-25 | `SecurityUtils.java` | Aligned JWT secret property key to use `jwt.secret`. | Antigravity | Prevents `401 Unauthorized` redirects by ensuring matching token signing and verification keys. |
| 2026-06-25 | `JwtAuthenticationFilter.java` | Replaced `null` credentials with `token` in `UsernamePasswordAuthenticationToken`. | Antigravity | Allows `SecurityUtils` to access the raw token for parsing user claims. |
| 2026-06-25 | `SecurityUtils.java` | Added debug stack trace logging inside `getCurrentUserClaims()`. | Antigravity | Prevents swallowing exceptions during token/claims parsing, improving debuggability. |
| 2026-06-25 | `AuthService.java` | Updated registration defaults, populated hotel owner details, and added `resendVerificationEmail`. | Antigravity | Resolves Hotel Owner auto-approval issue, sets up relationships correctly, and adds email resend feature. |
| 2026-06-25 | `AuthController.java` | Exposed `/resend-verification` GET endpoint. | Antigravity | Allows requesting new verification email when SMTP/network fails during signup. |
| 2026-06-25 | `AdminHotelService.java` | Injected `UserRepository`, annotated `approveHotel` with `@Transactional`, and auto-activated owner accounts on hotel approval. | Antigravity | Ensures Hotel Owners are activated only when their hotel is approved. |
| 2026-07-01 | `mock-auth.ts` | Disabled `MOCK_MODE` (set to `false`) for hotel-owner features. | Antigravity | Integrates real JWT login auth for hotel owners instead of using dev ID 40 bypass. |
| 2026-07-01 | `AppRoutes.tsx` | Removed `/dev` developer role-selector bypass landing page. | Antigravity | Completes deprecation of the temporary mock login selector page. |
| 2026-07-01 | `AgentRepository.java` & `HotelRepository.java` | Declared `findByOwnerId` finder methods. | Antigravity | Allows looking up Agent and Hotel profiles by their linked User ID. |
| 2026-07-01 | `AuthService.java` | Enforced strict profile checks on login for both Agent and Hotel Owner, returning resolved IDs. | Antigravity | Fails login if the user has no matching Agent or Hotel record in the DB. |
| 2026-07-01 | `Agent*Service.java` & `DriverService.java` | Refactored backend service methods to resolve the Agent row using the User ID. | Antigravity | Keys the Travel Agent dashboard strictly on the User ID, matching frontend credentials. |

---

## Detailed Change Records

### [Pending] SecurityConfig.java
- **Change**: Implement `SecurityFilterChain` with JWT filter.
- **Impact**: All endpoints will now require authentication unless explicitly permitted.

### [Pending] application.properties
- **Change**: Adding `supabase.bucket=package-images` and `supabase.review-bucket=review-images`.
- **Impact**: Ensures compatibility with teammates' storage services.

### [2026-06-25] AuthService.java
- **Change**: Added `@Transactional` annotation to `login(LoginRequest)` method and imported `org.springframework.transaction.annotation.Transactional`.
- **Rationale**: Keeps the Hibernate session open while `JwtTokenProvider.generateToken` accesses lazy-loaded entity fields (such as `User.agencies`), resolving `LazyInitializationException`.

### [2026-06-25] SecurityUtils.java
- **Change**: Updated the `@Value` property key from `app.jwt.secret` to `jwt.secret`.
- **Rationale**: Aligns the token verification key with the signing key (`your_very_long_and_secure_jwt_secret_key_here`) used by `JwtTokenProvider`, resolving `401 Unauthorized` errors on authenticated REST requests.

### [2026-06-25] JwtAuthenticationFilter.java
- **Change**: Replaced `null` credentials with `token` in `UsernamePasswordAuthenticationToken` constructor.
- **Rationale**: Ensures the JWT token is persisted in the security context credentials, allowing `SecurityUtils.getCurrentUserClaims()` to fetch and parse the token for secured endpoints (e.g., notification queries).

### [2026-06-25] SecurityUtils.java (Logging update)
- **Change**: Added `System.err.println` and `e.printStackTrace()` to the `catch` block of `getCurrentUserClaims()`.
- **Rationale**: Swallowing JWT signature/parsing errors previously made debugging authentication redirects difficult. The logging now prints details of any parsing failures directly to standard error.

### [2026-06-25] Registration & Verification Update (AuthService.java & AuthController.java)
- **Change**: Updated registration builder so only tourists are registered as `ACTIVE`, whereas other roles are registered as `PENDING`. Set hotel owner details (`owner`, `ownerName`, `ownerEmail`, `ownerNic`, `ownerId`, `destination`) during hotel creation block in `register()`. Added `resendVerificationEmail(String email)` method and exposed `/api/auth/resend-verification` in `AuthController`.
- **Rationale**: Resolves Hotel Owner auto-approval and provides a public endpoint to resend validation emails when network failures occur during signup.

### [2026-06-25] Hotel Owner Activation (AdminHotelService.java)
- **Change**: Injected `UserRepository`, annotated `approveHotel` with `@Transactional` (and imported it), and added code to update the associated hotel owner's status to `"ACTIVE"` and `isActive = true`.
- **Rationale**: Ensures Hotel Owners are kept pending until their hotel is approved, and automatically activates their user accounts when the hotel is approved by the admin.

### [2026-07-01] Deactivate Hotel Owner Mock Bypass (mock-auth.ts)
- **Change**: Set `MOCK_MODE` to `false` in `mock-auth.ts`.
- **Rationale**: Fully integrates the hotel owner dashboard with the real JWT-based authentication system rather than bypassing it via a static ID 40 session.

### [2026-07-01] Decommission Developer Role Selector Bypass (AppRoutes.tsx)
- **Change**: Removed the `/dev` developer role-selector route mapping.
- **Rationale**: Cleanly deprecates the temporary landing page so all login attempts must go through the standard production auth flow.

### [2026-07-01] Strict Profile Resolving & Fallback Removal (Agent and Hotel portals)
- **Change**:
  * Added `findByOwnerId` query methods to `AgentRepository.java` and `HotelRepository.java`.
  * Updated `AuthService.java` to search the `agents` and `hotels` tables dynamically using the logged-in User ID. If no matching profile is found, it throws an `UnauthorizedException`.
  * Refactored all backend services (`AgentProfileService.java`, `AgentPackageService.java`, `AgentVehicleService.java`, `AgentBookingService.java`, `AgentSettingsService.java`, `AgentAnalyticsService.java`, `DriverService.java`, and `AgentDashboardService.java`) to lookup profiles using the User ID (`findByOwnerId`) rather than custom auto-increment keys.
  * Cleaned up the frontend `api.ts` `AGENT_ID` dynamic property to use `user.id` directly and removed the hardcoded `|| 5` fallback.
- **Rationale**: Ensures that a user's ID is the unique, primary identifier throughout all API transactions, completely deprecating fallback/mock states and rendering a clear error if the user's database records are incomplete.

### [2026-07-01] Integrated Full Signup Fields & Form Validations (AuthPage.tsx)
- **Change**:
  * Added all missing signup fields (Telephone, Preferred Language, Nationality, Agency Name, Hotel Name, Business Registration ID, Business Address, District, and NIC Number) to `AuthPage.tsx`.
  * Integrated Sri Lankan NIC validation formats using `@/utils/nicValidation` helper.
  * Mapped all form fields to the backend register request body.
- **Rationale**: Matches backend validation requirements and restores the required layout fields for all user roles during registration.

