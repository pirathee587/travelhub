# User Signup System Audit Report

This report presents a code audit of the user registration and signup system in the TravelHub application, covering both frontend (React) and backend (Spring Boot) implementation layers.

---

## 1. Identified Gaps, Shortcuts & Security Bypasses

### 🚨 Major: Unrestricted Admin Role Registration (Security Bypass)
* **Description:** The backend registration endpoint `/api/auth/register` maps the incoming `role` parameter directly from the HTTP request payload (`RegisterRequest.getRole()`) without validation or restriction.
* **Risk:** Although the frontend dropdown only exposes `Tourist`, `Agent`, and `Hotel Owner` options, a user can bypass the frontend UI and send a direct POST request containing `"role": "ADMIN"`. Once they verify their email, they will have full administrator privileges on the system.
* **Code Location:** [AuthService.java:54](file:///home/thanushiyan/Desktop/travelhub/travelhub_backend/src/main/java/com/travelhub/backend/service/AuthService.java#L54)

### ⚠️ Medium: No Backend Validation for NIC Formats
* **Description:** The Sri Lankan NIC validation (checking 9-digit `V/X` format or 12-digit format) is performed exclusively in the React frontend using the `validateNIC()` utility. 
* **Risk:** The backend `RegisterRequest` accepts the `nicNumber` string without any pattern matching, and the database schema stores it as a regular string. Direct API clients can register accounts with empty, malformed, or fake NIC strings.
* **Code Location:** [RegisterRequest.java:40](file:///home/thanushiyan/Desktop/travelhub/travelhub_backend/src/main/java/com/travelhub/backend/dto/request/RegisterRequest.java#L40)

### ℹ️ Low: Hotel Owner User Account Auto-Approval
* **Description:** Unlike Agents, whose status is checked during login using the `agentApproved` flag, newly registered Hotel Owners are created with status `"ACTIVE"` and `isActive = true` directly.
* **Analysis:** Although their linked `Hotel` entity defaults to `"Pending"` status (and needs approval before its rooms go live), the Hotel Owner user account itself bypasses any admin check and is active immediately after email verification.
* **Code Location:** [AuthService.java:64](file:///home/thanushiyan/Desktop/travelhub/travelhub_backend/src/main/java/com/travelhub/backend/service/AuthService.java#L64)

### ℹ️ Low: Email Fail-Safe Success
* **Description:** If the SMTP server fails or throws an exception when sending the verification email, the registration process does not roll back. Instead, it catches the exception and returns a success response.
* **Analysis:** While this prevents registration errors due to mail server outages, it leaves newly registered Agents and Hotel Owners in an unverified state (`isEmailVerified = false`) with no way to trigger a resend, requiring manual DB intervention to unlock.
* **Code Location:** [AuthService.java:93-98](file:///home/thanushiyan/Desktop/travelhub/travelhub_backend/src/main/java/com/travelhub/backend/service/AuthService.java#L93-L98)

---

## 2. Dynamic Component & Flow Summary

### Frontend Flow:
1. Form captures input fields. If the role is `AGENT` or `HOTEL_OWNER`, the user has the option to scan their NIC card using `tesseract.js` for local OCR.
2. Form submission runs `validateNIC` validation checks.
3. Sends POST request to `/api/auth/register`.

### Backend Flow:
1. `AuthController` validates the request payload using standard JSR-380 annotations.
2. Checks if email is already registered.
3. Hashes password using BCrypt.
4. Auto-verifies `isEmailVerified = true` for `Role.TOURIST`. Sets email verified to `false` for other roles.
5. Saves the user record. If `Role.AGENT`, it creates a child `Agent` record. If `Role.HOTEL_OWNER`, it creates a default `Hotel` record and links its ID.
6. Dispatches a verification email containing a UUID token.
