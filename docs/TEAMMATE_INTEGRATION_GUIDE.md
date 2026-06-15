# TravelHub — Teammate Integration Guide

**Module:** User Management, Payments, Email & Notifications  
**Owner:** Thanushiyan  
**Branch:** Share this doc when pulling the user-management branch.

---

## 1. What this branch adds

| Area | What's included |
|------|-----------------|
| **Auth** | Register, login, email verification (required before login), forgot/reset password |
| **Payments** | PayHere sandbox checkout, billing history, PDF receipts |
| **Notifications** | In-app notifications (`user_notifications`) + email logs (`email_logs`) |
| **Emails** | Registration, password reset, booking, payment confirmation (via `NotificationListener`) |
| **Frontend** | `/billing`, `/notifications`, `/payment/:id`, login redirect to role dashboards |

**Not in this module:** Tourist/agent/admin dashboards, packages UI, profile pages — those stay with respective teammates.

---

## 2. Setup after pulling

### Backend (`travelhub_backend`)

```bash
cp .env.example .env
# Edit .env with your own SMTP, PayHere sandbox, and shared Supabase DB credentials
./mvnw spring-boot:run
```

- Secrets are **not** in `application.properties` anymore — they load from `.env` at startup.
- **Never commit** `.env` (it is gitignored).
- Shared DB credentials: ask the team lead for Supabase URL/username/password.
- **Gmail SMTP** and **PayHere sandbox**: each developer uses their own keys on their machine.

### Frontend (`travelhub_frontend`)

```bash
npm install
npm run dev
```

- API base URL: `http://localhost:8080/api` (see `src/services/api.js`).
- Frontend runs at `http://localhost:5173`.

### Database migration (required)

Pull and run Flyway — this branch adds:

**`V8__user_notifications_email_logs_admin_password.sql`**

Creates:
- `user_notifications` — in-app alerts for tourists/users
- `email_logs` — audit trail for sent/failed emails

> **Note:** V6 and V7 in the shared Supabase DB belong to the Hotel module. This branch uses `spring.flyway.ignore-migration-patterns=*:missing` so missing teammate migration files do not block startup.

---

## 3. Environment variables (`.env`)

| Variable | Description |
|----------|-------------|
| `DB_URL` | Supabase PostgreSQL JDBC URL |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `APP_BASE_URL` | Frontend URL (`http://localhost:5173`) |
| `APP_BACKEND_URL` | Backend URL (`http://localhost:8080`) |
| `ADMIN_EMAIL` | Email that receives admin review alerts |
| `SMTP_USERNAME` | Gmail address for sending emails |
| `SMTP_PASSWORD` | Gmail app password |
| `JWT_SECRET` | Long random string (min 32 chars) |
| `PAYHERE_MERCHANT_ID` | PayHere sandbox merchant ID |
| `PAYHERE_MERCHANT_SECRET` | PayHere sandbox secret |
| `SUPABASE_URL` | Supabase project URL (optional) |
| `SUPABASE_ANON_KEY` | Supabase anon key (optional) |

---

## 4. New API endpoints (your modules can call these)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/payments/checkout/{bookingId}` | JWT | PayHere checkout data |
| `GET` | `/api/payments/return` | Public | Verify payment after PayHere redirect |
| `POST` | `/api/payments/notify` | Public | PayHere IPN webhook |
| `GET` | `/api/payments/my-billing` | JWT | User payment history |
| `GET` | `/api/payments/receipt/{bookingId}` | JWT | Download PDF receipt |
| `GET` | `/api/users/me/notifications` | JWT | In-app notifications |
| `PATCH` | `/api/users/me/notifications/{id}/read` | JWT | Mark notification read |
| `PATCH` | `/api/users/me/notifications/read-all` | JWT | Mark all read |

Auth endpoints remain under `/api/auth/*`.

---

## 5. Booking event triggers (ACTION REQUIRED)

The notification system is **ready** but booking emails/payment links only fire when **your code publishes `BookingEvent`**.

### Event class (already exists)

```java
import com.travelhub.backend.event.BookingEvent;
import org.springframework.context.ApplicationEventPublisher;
```

Inject `ApplicationEventPublisher` in your booking service.

### Trigger 1 — Booking created (`CREATED`)

**File:** `BookingCreationService.java` — after `bookingRepository.save(...)`

```java
eventPublisher.publishEvent(new BookingEvent(this, savedBooking, "CREATED"));
```

**Result:** Tourist gets "booking received" email + notification. Agent gets in-app alert.

---

### Trigger 2 — Agent approves (`APPROVED`)

**File:** `AgentBookingService.acceptBooking()` — after save

```java
eventPublisher.publishEvent(new BookingEvent(this, booking, "APPROVED"));
```

**Result:** Tourist gets email with **Pay Now** link → `/payment/{bookingId}` and in-app notification.

**Payment rule:** Tourist can only pay when booking status is **`active`** (set by `acceptBooking()`).

---

### Trigger 3 — Agent declines (`DECLINED`)

**File:** `AgentBookingService.declineBooking()` — after save

```java
String reason = request != null ? request.getReason() : null;
eventPublisher.publishEvent(new BookingEvent(this, booking, "DECLINED", reason));
```

**Result:** Tourist gets decline email + notification.

---

### Booking status flow (must stay consistent)

| Step | `bookings.status` | Set by |
|------|-------------------|--------|
| Tourist books | `pending` | `BookingCreationService` |
| Agent accepts | `active` | `AgentBookingService.acceptBooking()` |
| Tourist pays | `Paid` | `PaymentService` (automatic) |
| Agent declines | `cancelled` | `AgentBookingService.declineBooking()` |

---

### Listener reference

| Event | Email | Tourist in-app | Agent in-app |
|-------|-------|----------------|--------------|
| `CREATED` | Booking received | Pending approval | New booking request |
| `APPROVED` | Approved + pay link | Pay now | — |
| `DECLINED` | Declined + reason | Booking declined | — |

Listener: `src/main/java/com/travelhub/backend/listener/NotificationListener.java`

**Do not modify** `NotificationListener`, `EmailService`, or payment APIs without coordinating with the User Management owner.

---

## 6. Payment flow (for tourists)

1. Tourist creates booking → status `pending`
2. Agent approves → status `active` + `APPROVED` event fires
3. Tourist opens `/payment/{bookingId}` or link from email/notification
4. PayHere sandbox checkout completes
5. Return URL verifies payment → status `Paid`
6. Confirmation email sent → visible on `/billing` and `/notifications`

**Local testing:** PayHere `notify_url` (`localhost:8080`) won't work without ngrok. Return URL flow works on localhost.

---

## 7. Frontend routes (this module)

| Route | Who | Purpose |
|-------|-----|---------|
| `/login`, `/signup`, `/verify` | All | Auth |
| `/billing` | Logged-in users | Payment history + receipts |
| `/notifications` | Logged-in users | In-app notifications |
| `/payment/:id` | Logged-in tourist | PayHere checkout |
| `/payment-success` | Logged-in tourist | Post-payment confirmation |
| `/` | Logged-in | Redirects to role dashboard (tourist → `/tourist/dashboard`) |

Packages remain at `/packages` (Package module).

---

## 8. Default admin account

- **Email:** `saras69wathy+superadmin@gmail.com`
- **Password:** `admin123` (updated in V8 migration)

---

## 9. Verify integration

1. Pull branch + copy `.env.example` → `.env`
2. Start backend — Flyway runs V8
3. Add `BookingEvent` triggers in your booking services
4. Register tourist → verify email → login
5. Create booking → agent approves → tourist pays
6. Check `/billing`, `/notifications`, and email inbox

---

## 10. Questions / conflicts

Contact the User Management module owner before changing:

- `NotificationListener.java`
- `EmailService.java`
- `PaymentService.java` / `PaymentController.java`
- `AuthService.java`
- `user_notifications` / `email_logs` tables
