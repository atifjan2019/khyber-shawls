# Deployment Files

This directory contains all necessary files and scripts for deploying the Khyber Shawls application to a production VPS server.

## 📁 File Structure

```
deployment/
├── README.md                    # Complete deployment guide
├── vps-setup.sh                 # Initial VPS setup script (run once)
├── ecosystem.config.js          # PM2 configuration
├── nginx.conf                   # Nginx reverse proxy config
├── khyber-shawls.service       # Systemd service file (alternative to PM2)
├── backup-db.sh                 # Database backup script
├── backup-uploads.sh            # File uploads backup script
├── deploy.sh                    # Automated deployment script
└── .env.production.example      # Production environment variables template
```

## 🚀 Quick Start

### 1. On your VPS (as root):

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/webspires-eng/khyber-shawls/main/deployment/vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

### 2. Switch to deploy user:

```bash
su - deploy
```

### 3. Clone and deploy:

```bash
git clone https://github.com/webspires-eng/khyber-shawls.git
cd khyber-shawls
```

### 4. Follow the complete guide:

See [deployment/README.md](./README.md) for detailed step-by-step instructions.

## 🔧 Configuration Files

### PM2 (Recommended)
- **File**: `ecosystem.config.js`
- **Usage**: `pm2 start ecosystem.config.js`
- **Benefits**: Auto-restart, logs, monitoring

### Systemd (Alternative)
- **File**: `khyber-shawls.service`
- **Usage**: Copy to `/etc/systemd/system/`
- **Benefits**: Native system integration

### Nginx
- **File**: `nginx.conf`
- **Usage**: Copy to `/etc/nginx/sites-available/`
- **Benefits**: Reverse proxy, SSL, caching

## 📦 Backup Scripts

### Database Backup
```bash
chmod +x backup-db.sh
./backup-db.sh
```

### Uploads Backup
```bash
chmod +x backup-uploads.sh
./backup-uploads.sh
```

### Setup Automatic Backups
```bash
crontab -e
# Add these lines:
0 2 * * * /home/deploy/backup-db.sh >> /home/deploy/backup.log 2>&1
0 3 * * * /home/deploy/backup-uploads.sh >> /home/deploy/backup.log 2>&1
```

## 🔄 Automated Deployment

### Manual Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

### CI/CD with GitHub Actions
1. Add secrets to GitHub repository:
   - `VPS_HOST` - Your VPS IP address
   - `VPS_USERNAME` - SSH username (deploy)
   - `VPS_SSH_KEY` - Private SSH key
   - `VPS_PORT` - SSH port (default: 22)

2. Push to main branch triggers automatic deployment

## 🔒 Security Checklist

Before going live, ensure:

- [ ] Changed default MySQL password
- [ ] Generated strong NEXTAUTH_SECRET
- [ ] Configured firewall (UFW)
- [ ] Enabled SSL/HTTPS with Certbot
- [ ] Setup automatic security updates
- [ ] Regular database backups scheduled
- [ ] Regular file backups scheduled
- [ ] Monitoring enabled (PM2/UptimeRobot)
- [ ] Error logging configured
- [ ] Strong passwords for all services

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit          # Real-time monitoring
pm2 status         # Status overview
pm2 logs           # View logs
pm2 restart all    # Restart all apps
```

### Logs Location
- **PM2 Logs**: `~/.pm2/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `journalctl -u khyber-shawls`

## 🆘 Troubleshooting

### App won't start
```bash
pm2 logs khyber-shawls
cd ~/khyber-shawls && npm run build
```

### Database connection errors
```bash
mysql -u khyber_user -p khybershawls
# Check DATABASE_URL in .env
```

### Nginx 502 errors
```bash
pm2 status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
sudo certbot renew
sudo certbot certificates
```

## 🔄 Updates

To update the application:

```bash
cd ~/khyber-shawls
./deploy.sh
```

Or manually:

```bash
git pull origin main
npm ci
npx prisma migrate deploy
npm run build
pm2 restart khyber-shawls
```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

## 🐛 Support

If you encounter issues:

1. Check logs: `pm2 logs khyber-shawls`
2. Check Nginx: `sudo nginx -t`
3. Check environment: `cat ~/khyber-shawls/.env`
4. Check disk space: `df -h`
5. Check memory: `free -m`

---

**Need Help?** Open an issue on GitHub or contact the development team.
