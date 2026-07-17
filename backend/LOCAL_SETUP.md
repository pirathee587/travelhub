# 🛠️ Backend Local Setup Guide

> **Important:** The `.env` file is **NOT in Git** (it's gitignored for security).  
> Every team member must create their own `.env` file locally before running the backend.

---

## Step 1 — Prerequisites

Make sure you have these installed:
- Java 21
- Maven (or use the included `mvnw`)
- Git

---

## Step 2 — Create your `.env` file

Inside the `backend/` folder, create a file named **`.env`** (no extension).

```
backend/
├── .env          ← Create this file (ask team lead for values)
├── run.ps1
├── pom.xml
└── src/
```

Paste the following content into `.env` and fill in the real values  
*(get these from the team lead / group chat — never commit them to Git):*

```env
DB_URL=jdbc:postgresql://<supabase-pooler-url>:6543/postgres?prepareThreshold=0&sslmode=require
DB_USERNAME=postgres.<your-project-ref>
DB_PASSWORD=<your-db-password>

GMAIL_APP_PASSWORD=<gmail-app-password>

SUPABASE_KEY=<your-supabase-anon-key>

PAYHERE_SECRET=<payhere-merchant-secret>
```

---

## Step 3 — Run the Backend

> ⚠️ Do **NOT** use `mvn spring-boot:run` directly — the env variables won't load.

Open **PowerShell**, navigate to the `backend/` folder, and run:

```powershell
cd C:\path\to\travelhub\backend
.\run.ps1
```

You should see:

```
Loading environment variables from .env...
  SET DB_URL
  SET DB_USERNAME
  SET DB_PASSWORD
  SET GMAIL_APP_PASSWORD
  SET SUPABASE_KEY
  SET PAYHERE_SECRET

Starting Spring Boot...
```

And then:

```
[SUCCESS] PostgreSQL: Connected to Supabase!
```

The backend will be available at: **http://localhost:8080**

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `${DB_URL}` not resolved | Ran `mvn spring-boot:run` directly | Use `.\run.ps1` instead |
| `Port 8080 already in use` | Another instance is running | Run `Stop-Process -Name java -Force` in PowerShell, then retry |
| `.env file not found` | Missing `.env` file | Create it as shown in Step 2 |
| `CommandNotFoundException: run.ps1` | Wrong directory | Make sure you're inside `backend/` folder |

---

## Security Reminder

- **NEVER** commit `.env` to Git
- **NEVER** share secrets in group chats / email — use a password manager
- If any secret is accidentally pushed, rotate it immediately on Supabase / Gmail / PayHere dashboard
