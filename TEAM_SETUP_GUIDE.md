# 🌍 TravelHub — Team Setup Guide

> **Version**: July 2026  
> **Stack**: Spring Boot 3.5 + React (Vite) + PostgreSQL (Supabase)  
> **Author**: Piratheepan (Team Lead)

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [Running the Project](#5-running-the-project)
6. [Project Architecture](#6-project-architecture)
7. [Key Changes & Important Notes](#7-key-changes--important-notes)
8. [Common Errors & Fixes](#8-common-errors--fixes)
9. [Security Rules](#9-security-rules)

---

## 1. Prerequisites

Make sure you have **all of these installed** before starting:

| Tool | Version | Download |
|------|---------|----------|
| **Java** | 21 (LTS) | https://adoptium.net |
| **Maven** | 3.9+ | https://maven.apache.org/download.cgi |
| **Node.js** | 18+ | https://nodejs.org |
| **Git** | Latest | https://git-scm.com |
| **PowerShell** | 5.1+ (built-in Windows) | Pre-installed on Windows |

### Verify Installations

Open PowerShell and run:

```powershell
java -version       # Should say: openjdk 21.x.x
mvn -version        # Should say: Apache Maven 3.x.x
node -version       # Should say: v18.x.x or higher
npm -version        # Should say: 10.x.x or higher
git --version       # Should say: git version 2.x.x
```

---

## 2. Clone the Repository

```powershell
git clone <repository-url>
cd travelhub
```

---

## 3. Backend Setup

### Step 3.1 — Create the `.env` file

The `.env` file is NOT in Git. You MUST create this manually.
Ask the team lead for the actual values.

Navigate to the `backend/` folder and create a file named `.env` (no extension):

```
travelhub/
└── backend/
    ├── .env          <- CREATE THIS FILE (get values from team lead)
    ├── run.ps1
    ├── pom.xml
    └── src/
```

Paste the following into `.env` and fill in the real values:

```env
DB_URL=jdbc:postgresql://<supabase-pooler-url>:6543/postgres?prepareThreshold=0&sslmode=require
DB_USERNAME=postgres.<your-project-ref>
DB_PASSWORD=<your-db-password>

GMAIL_APP_PASSWORD=<gmail-app-password>

SUPABASE_KEY=<your-supabase-anon-key>

PAYHERE_SECRET=<payhere-merchant-secret>
```

---

## 4. Frontend Setup

Navigate to the `frontend/` folder and install dependencies:

```powershell
cd frontend
npm install
```

---

## 5. Running the Project

You need TWO separate PowerShell terminals — one for backend, one for frontend.

### Terminal 1 — Start Backend

```powershell
cd C:\path\to\travelhub\backend
powershell -ExecutionPolicy Bypass -File ".\run.ps1"
```

Expected output:

```
Loading environment variables from .env...
  SET DB_URL
  SET DB_USERNAME
  SET DB_PASSWORD
  SET GMAIL_APP_PASSWORD
  SET SUPABASE_KEY
  SET PAYHERE_SECRET

Starting Spring Boot...

[SUCCESS] PostgreSQL: Connected to Supabase!
Started BackendApplication in ~17 seconds
```

Backend is ready at: http://localhost:8080

### Terminal 2 — Start Frontend

```powershell
cd C:\path\to\travelhub\frontend
npm run dev
```

Frontend is ready at: http://localhost:5173

### Startup Order (IMPORTANT)

```
Step 1  ->  Start BACKEND first  (wait for "Started BackendApplication")
Step 2  ->  Start FRONTEND second
Step 3  ->  Open browser -> http://localhost:5173
```

---

## 6. Project Architecture

```
travelhub/
├── backend/                    <- Spring Boot (Java 21)
│   ├── src/main/java/
│   │   └── com/travelhub/backend/
│   │       ├── controller/     <- REST API endpoints
│   │       ├── service/        <- Business logic
│   │       ├── repository/     <- Database queries (JPA)
│   │       ├── model/          <- Entity classes
│   │       ├── security/       <- JWT auth filters
│   │       └── config/         <- App configuration
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/       <- Flyway SQL migrations
│   ├── .env                    <- Local secrets (NOT in Git)
│   └── run.ps1                 <- Startup script (loads .env)
│
└── frontend/                   <- React + Vite + TypeScript
    ├── src/
    │   ├── components/         <- Reusable UI components
    │   ├── pages/              <- Route pages
    │   ├── hooks/              <- Custom React hooks
    │   ├── services/           <- API call functions
    │   └── utils/              <- Helper utilities
    └── vite.config.js
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| UI Components | Radix UI, shadcn/ui, Lucide Icons |
| HTTP Client | Axios |
| Backend | Spring Boot 3.5, Java 21 |
| Database | PostgreSQL (Supabase cloud) |
| DB Migrations | Flyway |
| Auth | JWT (stateless) |
| File Storage | Supabase Storage |
| Payment | PayHere |
| Email | Gmail SMTP |

---

## 7. Key Changes & Important Notes

### Authentication System

- JWT-based auth is fully live — no more mock bypass
- `MOCK_MODE` in `mock-auth.ts` is set to `false` — do NOT change it back to `true`
- The `/dev` route (developer role selector) has been removed
- All users must login through: http://localhost:5173/auth

### User Roles & Login Flow

| Role | Activation |
|------|------------|
| Tourist | Auto-activated after email verify |
| Travel Agent | Manual admin approval required |
| Hotel Owner | Auto-activated when hotel is approved by admin |
| Admin | Always active (pre-configured) |

### Hotel Owner Activation Flow

- Hotel Owners are PENDING until admin approves their hotel
- Once admin clicks "Approve Hotel" -> owner's account is automatically activated
- Hotel Owners can then login normally

### Registration Form Fields

All roles now have complete signup form:
- **Tourist**: Name, Email, Password, Phone, Nationality, Preferred Language, NIC
- **Travel Agent**: Above + Agency Name, Business Reg ID, Business Address, District
- **Hotel Owner**: Above + Hotel Name, Business Reg ID, Business Address, District

### Database Notes

- Flyway manages all DB migrations automatically on startup
- Current schema version: **18**
- Never run raw SQL to modify schema — always create a new migration file

---

## 8. Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `${DB_URL}` in logs | Ran `mvn spring-boot:run` directly | Use `.\run.ps1` instead |
| `.env file not found` | Missing `.env` file | Create it as shown in Step 3.1 |
| `Port 8080 already in use` | Another Java process running | Run: `Stop-Process -Name java -Force` |
| `CommandNotFoundException: run.ps1` | Wrong directory | `cd` into `backend/` folder first |
| `401 Unauthorized` on API calls | JWT secret mismatch | Check `.env` values are correct |
| `npm install` fails | Old Node.js version | Update Node.js to v18+ |
| Frontend shows blank page | Backend not running | Start backend first, then frontend |
| Login fails for Hotel Owner | Hotel not yet approved | Ask admin to approve the hotel |
| ExecutionPolicy error | PowerShell policy | Use `powershell -ExecutionPolicy Bypass -File ".\run.ps1"` |

---

## 9. Security Rules

MANDATORY for all team members:

1. NEVER commit `.env` to Git
2. NEVER share API keys or passwords in WhatsApp/Telegram/Email
3. NEVER hardcode credentials in source code
4. NEVER push with `git push --force` without team lead approval
5. If any secret is accidentally pushed to Git, immediately rotate it:
   - DB password -> Supabase dashboard
   - Gmail App Password -> Google Account Security
   - Supabase Key -> Supabase API settings
   - PayHere Secret -> PayHere merchant dashboard

---

*Last updated: July 2026 | TravelHub Project Team*
