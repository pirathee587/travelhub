#!/usr/bin/env bash
# ==============================================================================
# TravelHub AWS EC2 Server Setup Script (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
# This script prepares a clean AWS EC2 Ubuntu instance for TravelHub:
# 1. Updates system packages
# 2. Installs Docker Engine & Docker Compose Plugin
# 3. Configures non-root user permissions for Docker
# 4. Installs & enables Nginx Reverse Proxy and Certbot for SSL
# 5. Configures UFW firewall for Ports 22 (SSH), 80 (HTTP), and 443 (HTTPS)
# 6. Sets up the TravelHub application directory
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🚀 TravelHub AWS EC2 Automated Provisioning Script"
echo "=========================================================="

# 1. Update and upgrade Ubuntu system packages
echo "📦 Step 1: Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    htop \
    unzip

# 2. Install Docker Engine & Docker Compose Plugin
echo "🐳 Step 2: Installing official Docker Engine..."
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Enable Docker and add current user to docker group
echo "👤 Step 3: Configuring Docker permissions for $USER..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER"

# 4. Configure Firewall (UFW)
echo "🛡️ Step 4: Configuring UFW firewall..."
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# 5. Create TravelHub Directory
echo "📁 Step 5: Setting up TravelHub project directory..."
APP_DIR="$HOME/travelhub"
if [ ! -d "$APP_DIR" ]; then
    echo "Creating directory: $APP_DIR"
    mkdir -p "$APP_DIR"
fi

echo "=========================================================="
echo "✅ EC2 Server Setup Completed Successfully!"
echo "=========================================================="
echo ""
echo "Next Steps:"
echo "1. Clone your repository into ~/travelhub:"
echo "   git clone https://github.com/pirathee587/travelhub.git ~/travelhub"
echo "   (or cd ~/travelhub if already cloned)"
echo ""
echo "2. Create your .env file inside ~/travelhub/.env using deploy/.env.example:"
echo "   cp deploy/.env.example .env"
echo "   nano .env"
echo ""
echo "3. Copy the Nginx configuration and activate it:"
echo "   sudo cp deploy/nginx/travelhub.conf /etc/nginx/sites-available/travelhub"
echo "   sudo ln -sf /etc/nginx/sites-available/travelhub /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "4. Obtain free SSL certificate with Certbot:"
echo "   sudo certbot --nginx -d api.yourdomain.com"
echo ""
echo "5. Launch the containers:"
echo "   docker compose up -d --build"
echo "=========================================================="
