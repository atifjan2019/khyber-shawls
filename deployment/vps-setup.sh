#!/bin/bash

#######################################
# VPS Initial Setup Script
# Run this script on a fresh Ubuntu VPS
#######################################

set -e  # Exit on error

echo "=========================================="
echo "Khyber Shawls VPS Setup"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install essential tools
echo "Installing essential tools..."
apt install -y build-essential git curl wget unzip software-properties-common

# Install Node.js 20 LTS
echo "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node installation
node -v
npm -v

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install Certbot
echo "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install MySQL
echo "Installing MySQL..."
apt install -y mysql-server

# Secure MySQL installation
echo "Securing MySQL..."
mysql_secure_installation

# Create deploy user
echo "Creating deploy user..."
if id "deploy" &>/dev/null; then
    echo "User 'deploy' already exists"
else
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
    chmod 0440 /etc/sudoers.d/deploy
    echo "User 'deploy' created"
fi

# Setup firewall
echo "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw status

# Enable services
echo "Enabling services..."
systemctl enable nginx
systemctl enable mysql
systemctl start nginx
systemctl start mysql

# Create MySQL database and user
echo ""
echo "=========================================="
echo "MySQL Setup"
echo "=========================================="
echo "Please enter your desired MySQL password for 'khyber_user':"
read -s MYSQL_PASSWORD

mysql -e "CREATE DATABASE IF NOT EXISTS khybershawls;"
mysql -e "CREATE USER IF NOT EXISTS 'khyber_user'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON khybershawls.* TO 'khyber_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Switch to deploy user: su - deploy"
echo "2. Clone repository: git clone https://github.com/webspires-eng/khyber-shawls.git"
echo "3. Follow the deployment guide in deployment/README.md"
echo ""
echo "MySQL Database: khybershawls"
echo "MySQL User: khyber_user"
echo "MySQL Password: [saved securely]"
echo ""
echo "Important: Save your MySQL password securely!"
echo "You'll need it for the DATABASE_URL in .env"
echo ""
