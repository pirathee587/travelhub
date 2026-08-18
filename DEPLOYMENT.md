# 🚀 TravelHub Cloud Deployment & CI/CD Guide

This guide provides step-by-step instructions for deploying and maintaining the **TravelHub** platform in production:
- **Frontend** (React + Vite + TailwindCSS) on **Netlify**
- **Backend** (Spring Boot 3.5 / Java 21) & **Chatbot** (FastAPI / Groq) on **AWS EC2**
- **Database & Storage** on **Supabase PostgreSQL & Supabase S3 Storage**
- **CI/CD Automation** via **GitHub Actions**

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Browser[Client Browser]
    end

    subgraph Netlify CDN
        NetlifyApp[Frontend App / React SPA]
    end

    subgraph AWS EC2 Instance
        Nginx[Nginx Reverse Proxy + Let's Encrypt SSL]
        Backend[Spring Boot Backend :8080]
        Chatbot[FastAPI Chatbot :8001]
    end

    subgraph Cloud Services
        SupabaseDB[(Supabase PostgreSQL)]
        SupabaseStorage[(Supabase Storage Buckets)]
        GroqAPI[Groq LLM API]
        PayHere[PayHere Payment Gateway]
        GmailSMTP[Gmail SMTP Service]
    end

    Browser -->|HTTPS| NetlifyApp
    Browser -->|HTTPS API Requests| Nginx
    Nginx -->|/api/*| Backend
    Nginx -->|/chat, /sync| Chatbot
    Backend --> SupabaseDB
    Backend --> SupabaseStorage
    Backend --> PayHere
    Backend --> GmailSMTP
    Chatbot --> GroqAPI
    Chatbot <--> Backend
```

---

## 📋 Table of Contents
1. [AWS EC2 Server Setup](#1-aws-ec2-server-setup)
2. [Domain & Free SSL Setup (Certbot)](#2-domain--free-ssl-setup-certbot)
3. [Environment Configuration on EC2](#3-environment-configuration-on-ec2)
4. [Netlify Frontend Deployment](#4-netlify-frontend-deployment)
5. [GitHub Actions CI/CD Secrets Configuration](#5-github-actions-cicd-secrets-configuration)
6. [Testing & Verification](#6-testing--verification)
7. [Troubleshooting & Maintenance Commands](#7-troubleshooting--maintenance-commands)

---

## 1. AWS EC2 Server Setup

### Step 1.1: Launch EC2 Instance
1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**:
   - **Name**: `TravelHub-Production-Server`
   - **AMI**: `Ubuntu Server 24.04 LTS` (or `22.04 LTS`, 64-bit x86)
   - **Instance Type**: `t3.small` (minimum 2 GB RAM recommended) or `t3.medium`
   - **Key Pair**: Create or select an existing `.pem` key pair (e.g., `travelhub-ec2-key.pem`). **Save this file safely**.
   - **Storage**: At least 20–30 GB gp3 EBS volume.

### Step 1.2: Configure Security Group (Firewall)
Ensure your Security Group allows the following inbound traffic:

| Type | Protocol | Port Range | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `0.0.0.0/0` (or your IP) | Remote server administration |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Let's Encrypt challenge & HTTP redirect |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | Production encrypted API traffic |

### Step 1.3: SSH into EC2 & Run Automated Setup
Open your local terminal and connect:
```bash
chmod 400 travelhub-ec2-key.pem
ssh -i travelhub-ec2-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Clone the repository and run the automated provisioning script:
```bash
# Clone the repository
git clone https://github.com/pirathee587/travelhub.git ~/travelhub
cd ~/travelhub

# Make setup script executable and run it
chmod +x deploy/ec2-setup.sh
./deploy/ec2-setup.sh
```

---

## 2. Domain & Free SSL Setup (Certbot)

> [!IMPORTANT]
> Because Netlify serves the frontend over **HTTPS**, modern browsers strictly block standard HTTP backend API calls (**Mixed Content Policy**). You **must** attach a domain/subdomain with an SSL certificate to your EC2 instance.

### Option A: Using Your Custom Domain (e.g. `api.yourdomain.com`)
1. In your DNS provider (e.g., GoDaddy, Namecheap, Cloudflare, Route 53):
   - Add an **A Record**:
     - **Host**: `api` (or `@`)
     - **Points to / Value**: `<YOUR_EC2_PUBLIC_IP>`
     - **TTL**: 300 seconds / Auto

### Option B: Using Free Dynamic DNS (e.g. DuckDNS)
If you don't own a domain:
1. Go to [duckdns.org](https://www.duckdns.org) and log in.
2. Create a subdomain (e.g., `travelhub-api.duckdns.org`) pointing to your `<YOUR_EC2_PUBLIC_IP>`.

### Step 2.1: Configure Nginx & Issue Free SSL Certificate
On your EC2 terminal:
```bash
# 1. Update the server_name in the Nginx config with your actual domain:
sudo sed -i 's/api.yourdomain.com/YOUR_ACTUAL_DOMAIN/g' deploy/nginx/travelhub.conf

# 2. Link the configuration into Nginx
sudo cp deploy/nginx/travelhub.conf /etc/nginx/sites-available/travelhub
sudo ln -sf /etc/nginx/sites-available/travelhub /etc/nginx/sites-enabled/

# 3. Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# 4. Obtain free Let's Encrypt SSL certificate
sudo certbot --nginx -d YOUR_ACTUAL_DOMAIN
```

---

## 3. Environment Configuration on EC2

Create your `.env` file on EC2:
```bash
cd ~/travelhub
cp deploy/.env.example .env
nano .env
```

Fill in your actual production credentials:
```ini
DB_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
DB_USERNAME=postgres.your_project_ref
DB_PASSWORD=your_supabase_password

SUPABASE_URL=https://gzkohtgqtpbscczxuaaj.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key

JWT_SECRET=your_long_random_jwt_secret_minimum_32_characters

GMAIL_USERNAME=davidthanu1006@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_gmail_app_password

PAYHERE_MERCHANT_ID=1235619
PAYHERE_SECRET=your_payhere_secret
PAYHERE_CURRENCY=USD

CORS_ALLOWED_ORIGINS=https://travelhub.netlify.app,https://your-custom-domain.com,http://localhost:5173
APP_BASE_URL=https://travelhub.netlify.app

GROQ_API_KEY=your_groq_api_key
```

### Launch Containers:
```bash
docker compose up -d --build
```

Verify running containers:
```bash
docker compose ps
curl http://localhost:8080/api/health
curl http://localhost:8001/health
```

---

## 4. Netlify Frontend Deployment

### Method 1: Connecting Netlify Directly via Web UI
1. Log into [Netlify](https://app.netlify.com).
2. Click **Add new site** -> **Import an existing project** -> **GitHub**.
3. Select `pirathee587/travelhub`.
4. Configure Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Under **Environment variables**, add:
   - `VITE_API_URL`: `https://YOUR_BACKEND_DOMAIN` (e.g. `https://api.yourdomain.com` or `https://travelhub-api.duckdns.org`)
   - `VITE_SUPABASE_URL`: `https://gzkohtgqtpbscczxuaaj.supabase.co`
   - `VITE_SUPABASE_KEY`: `<your_supabase_anon_key>`
6. Click **Deploy Site**.

---

## 5. GitHub Actions CI/CD Secrets Configuration

To enable fully automated zero-downtime continuous deployment on every `git push`, configure GitHub Repository Secrets:

1. Go to your GitHub repository: `https://github.com/pirathee587/travelhub`
2. Navigate to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
3. Add the following secrets:

| Secret Name | Value Description | Example / Location |
| :--- | :--- | :--- |
| `NETLIFY_AUTH_TOKEN` | Netlify Personal Access Token | Netlify -> User settings -> Applications -> Personal access tokens |
| `NETLIFY_SITE_ID` | Netlify Site API ID | Netlify -> Site configuration -> General -> Site details -> API ID |
| `VITE_API_URL` | Backend HTTPS URL | `https://api.yourdomain.com` |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://gzkohtgqtpbscczxuaaj.supabase.co` |
| `VITE_SUPABASE_KEY` | Supabase Anon Public Key | Supabase Dashboard -> Project Settings -> API |
| `EC2_HOST` | Public IP or Elastic IP of EC2 | `34.220.12.34` |
| `EC2_USERNAME` | SSH User for EC2 Ubuntu | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` SSH Private Key | Open your `.pem` key in Notepad and paste full text starting with `-----BEGIN RSA PRIVATE KEY-----` |

---

## 6. Testing & Verification

### 6.1 Automated Verification:
- Trigger a GitHub push or manual workflow execution under the **Actions** tab in GitHub.
- Verify `Frontend CI/CD (Netlify)` passes and deploys to Netlify.
- Verify `Backend & Chatbot CI/CD (AWS EC2)` runs tests, SSHes into EC2, and rebuilds containers.

### 6.2 Manual Verification:
1. Open your Netlify site URL in browser (e.g. `https://travelhub.netlify.app`).
2. Open Browser DevTools -> Console & Network tab.
3. Test User Registration / Login.
4. Browse Packages, Hotels, and send a message to the AI Chatbot.
5. Verify zero Mixed Content errors and zero CORS errors.

---

## 7. Troubleshooting & Maintenance Commands

### Check Docker Container Status:
```bash
docker compose ps
```

### View Live Logs:
```bash
# Spring Boot Backend logs
docker compose logs -f backend

# AI Chatbot logs
docker compose logs -f chatbot

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services:
```bash
docker compose restart
sudo systemctl restart nginx
```

### Hard Reset & Rebuild:
```bash
docker compose down
docker compose up -d --build --force-recreate
```

### SSL Certificate Renewal:
Certbot auto-renews certificates via systemd timer. To test manually:
```bash
sudo certbot renew --dry-run
```
