# Khyber Shawls - VPS Deployment Guide

Complete guide to deploy this Next.js application to a Hostinger VPS (or any Ubuntu/Debian server).

## Prerequisites

- Ubuntu 20.04+ VPS with root/sudo access
- Domain name pointed to VPS IP address
- MySQL database (can be on same VPS or external)
- SSH access to the server

## Quick Start

Follow these steps in order:

### 1. Initial Server Setup (as root or sudo user)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Create deploy user
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/deploy

# Switch to deploy user
su - deploy
```

### 2. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install build essentials
sudo apt install -y build-essential git curl wget

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node -v  # should show v20.x.x
npm -v   # should show 10.x.x

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install MySQL (if not using external database)
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### 3. Setup MySQL Database

```bash
# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE khybershawls;
CREATE USER 'khyber_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON khybershawls.* TO 'khyber_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Clone and Configure Application

```bash
# Clone repository
cd ~
git clone https://github.com/webspires-eng/khyber-shawls.git
cd khyber-shawls

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Important: Update these values in `.env`:**

```env
# Database (use your actual credentials)
DATABASE_URL="mysql://khyber_user:your_strong_password@localhost:3306/khybershawls"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# Node Environment
NODE_ENV="production"

# Optional: If using email features
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Optional: If using Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
```

### 5. Install Dependencies and Build

```bash
# Install dependencies (clean install for production)
npm ci

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed database if needed
# npx prisma db seed

# Build the application
npm run build

# Create uploads directory
mkdir -p public/uploads
chmod -R 755 public/uploads
```

### 6. Setup PM2 Process Manager

```bash
# Copy PM2 ecosystem file
cp deployment/ecosystem.config.js .

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Run the command that PM2 outputs (it will be something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy

# Check status
pm2 status
pm2 logs khyber-shawls
```

### 7. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/khyber-shawls

# Edit the configuration to add your domain
sudo nano /etc/nginx/sites-available/khyber-shawls
# Replace 'yourdomain.com' with your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/khyber-shawls /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8. Setup SSL Certificate

```bash
# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 9. Setup Database Backup (Optional but Recommended)

```bash
# Copy backup script
cp deployment/backup-db.sh ~/backup-db.sh
chmod +x ~/backup-db.sh

# Edit the script with your database credentials
nano ~/backup-db.sh

# Create backup directory
mkdir -p ~/backups

# Test the backup script
~/backup-db.sh

# Setup daily backup cron job
crontab -e
# Add this line (runs daily at 2 AM):
0 2 * * * /home/deploy/backup-db.sh >> /home/deploy/backup.log 2>&1
```

### 10. Setup File Upload Backup (Optional)

```bash
# Copy upload backup script
cp deployment/backup-uploads.sh ~/backup-uploads.sh
chmod +x ~/backup-uploads.sh

# Edit crontab
crontab -e
# Add this line (runs daily at 3 AM):
0 3 * * * /home/deploy/backup-uploads.sh >> /home/deploy/backup.log 2>&1
```

## Post-Deployment

### Verify Deployment

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs khyber-shawls

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check SSL certificate
sudo certbot certificates
```

### Access Your Site

1. Open browser and navigate to: `https://yourdomain.com`
2. Test login functionality
3. Test file uploads
4. Check admin panel access

### Troubleshooting

**Application won't start:**
```bash
pm2 logs khyber-shawls
# Check for errors in the logs
```

**Database connection errors:**
```bash
# Test database connection
mysql -u khyber_user -p khybershawls
# If connection fails, check DATABASE_URL in .env
```

**Nginx 502 Bad Gateway:**
```bash
# Make sure app is running
pm2 status

# Check if port 3000 is listening
sudo netstat -tulpn | grep :3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**SSL certificate issues:**
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Updating the Application

When you push changes to GitHub:

```bash
# SSH into server
ssh deploy@your-vps-ip
cd ~/khyber-shawls

# Pull latest changes
git pull origin main

# Install any new dependencies
npm ci

# Run any new migrations
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart PM2
pm2 restart khyber-shawls

# Check logs
pm2 logs khyber-shawls
```

## Automated Deployment (Optional)

See `deployment/deploy.sh` for an automated deployment script.

```bash
# Copy deploy script
cp deployment/deploy.sh ~/deploy.sh
chmod +x ~/deploy.sh

# Run deployment
~/deploy.sh
```

## Monitoring

### PM2 Monitoring
```bash
# View real-time monitoring
pm2 monit

# View detailed status
pm2 status

# View logs
pm2 logs
```

### Setup External Monitoring
- Use services like UptimeRobot, Pingdom, or StatusCake
- Monitor: https://yourdomain.com
- Set up alerts for downtime

## Security Checklist

- [ ] Changed default MySQL password
- [ ] Generated strong NEXTAUTH_SECRET
- [ ] Configured firewall (UFW)
- [ ] Enabled SSL/HTTPS
- [ ] Setup automatic security updates
- [ ] Regular database backups
- [ ] Regular file backups
- [ ] Monitoring enabled

### Setup Firewall (UFW)

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

## Support

For issues or questions:
- Check logs: `pm2 logs khyber-shawls`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Review environment variables in `.env`
- Ensure database is accessible
- Verify DNS is pointing to correct IP

## Backup and Restore

### Backup
```bash
# Database
~/backup-db.sh

# Uploads
~/backup-uploads.sh

# Download backups to local machine
scp -r deploy@your-vps-ip:~/backups ./local-backups
```

### Restore
```bash
# Restore database
mysql -u khyber_user -p khybershawls < backup-file.sql

# Restore uploads
tar -xzf uploads-backup.tar.gz -C ~/khyber-shawls/public/
```

---

**Deployment completed!** 🎉

Your Khyber Shawls e-commerce site should now be live at `https://yourdomain.com`
