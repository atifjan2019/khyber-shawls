# Deployment Configuration

This directory contains all files needed to deploy Khyber Shawls to a production VPS.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get live in 15 minutes
- **[README.md](./README.md)** - Complete deployment guide
- **[FILES.md](./FILES.md)** - File descriptions

## 🚀 Quick Commands

### Initial Deploy
```bash
# On VPS as root
wget https://raw.githubusercontent.com/webspires-eng/khyber-shawls/main/deployment/vps-setup.sh
chmod +x vps-setup.sh && ./vps-setup.sh
```

### Update Deploy
```bash
# On VPS as deploy user
cd ~/khyber-shawls && ./deployment/deploy.sh
```

### Check Status
```bash
pm2 status
pm2 logs khyber-shawls
```

## 📦 Files

| File | Purpose |
|------|---------|
| `vps-setup.sh` | Initial VPS setup (run once) |
| `ecosystem.config.js` | PM2 configuration |
| `nginx.conf` | Nginx reverse proxy |
| `khyber-shawls.service` | Systemd service (alternative) |
| `backup-db.sh` | Database backup |
| `backup-uploads.sh` | Files backup |
| `deploy.sh` | Update deployment |
| `.env.production.example` | Environment template |

## 🔧 Configuration

All files are pre-configured. Just replace:
- `yourdomain.com` → Your actual domain
- Database credentials in `.env`
- Generate NEXTAUTH_SECRET

## ✅ Deployment Checklist

- [ ] VPS setup completed
- [ ] Domain DNS configured
- [ ] .env file configured
- [ ] Database created
- [ ] Application built
- [ ] PM2 running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Backups scheduled
- [ ] Monitoring setup

## 🆘 Support

Check logs:
```bash
pm2 logs khyber-shawls
sudo tail -f /var/log/nginx/error.log
```

See [README.md](./README.md) for troubleshooting.
