# 🚀 Quick Deploy to Hostinger VPS

**Get your Khyber Shawls e-commerce site live in 15 minutes!**

## Prerequisites
- ✅ Hostinger VPS with Ubuntu 20.04+
- ✅ Domain name pointed to VPS IP
- ✅ SSH access to VPS
- ✅ GitHub repository access

---

## 🎯 Option 1: Automated Setup (Easiest)

### Step 1: Initial VPS Setup (as root)

```bash
ssh root@your-vps-ip
wget https://raw.githubusercontent.com/webspires-eng/khyber-shawls/main/deployment/vps-setup.sh
chmod +x vps-setup.sh
./vps-setup.sh
```

**This script will:**
- ✅ Update system packages
- ✅ Install Node.js 20, PM2, Nginx, Certbot, MySQL
- ✅ Create deploy user
- ✅ Setup firewall
- ✅ Create database

### Step 2: Deploy Application (as deploy user)

```bash
su - deploy
git clone https://github.com/webspires-eng/khyber-shawls.git
cd khyber-shawls
cp deployment/.env.production.example .env
nano .env  # Edit with your values
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start deployment/ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Configure Nginx

```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/khyber-shawls
sudo nano /etc/nginx/sites-available/khyber-shawls  # Replace 'yourdomain.com'
sudo ln -s /etc/nginx/sites-available/khyber-shawls /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Setup SSL

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Setup Backups

```bash
cp deployment/backup-db.sh ~/backup-db.sh
cp deployment/backup-uploads.sh ~/backup-uploads.sh
chmod +x ~/backup-db.sh ~/backup-uploads.sh
nano ~/backup-db.sh  # Add your DB password
crontab -e
# Add these lines:
0 2 * * * /home/deploy/backup-db.sh >> /home/deploy/backup.log 2>&1
0 3 * * * /home/deploy/backup-uploads.sh >> /home/deploy/backup.log 2>&1
```

**🎉 Done! Visit https://yourdomain.com**

---

## 🛠️ Option 2: Manual Setup (Step by Step)

Follow the complete guide: [deployment/README.md](./deployment/README.md)

---

## 🔄 Future Updates

### Option A: Manual Update
```bash
cd ~/khyber-shawls
./deployment/deploy.sh
```

### Option B: Automatic with GitHub Actions

1. Add these secrets to your GitHub repository (Settings → Secrets):
   - `VPS_HOST`: Your VPS IP address
   - `VPS_USERNAME`: `deploy`
   - `VPS_SSH_KEY`: Your private SSH key
   - `VPS_PORT`: `22` (or your custom SSH port)

2. Push to `main` branch → Automatic deployment! ✨

---

## 📋 Important Environment Variables

Edit `.env` with these values:

```env
# Database
DATABASE_URL="mysql://khyber_user:YOUR_PASSWORD@localhost:3306/khybershawls"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-char-secret-here"

# App
NODE_ENV="production"
```

---

## 🔍 Verify Deployment

```bash
# Check app status
pm2 status

# View logs
pm2 logs khyber-shawls

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Test SSL
curl -I https://yourdomain.com
```

---

## 🆘 Common Issues

### App not starting?
```bash
pm2 logs khyber-shawls  # Check error logs
cd ~/khyber-shawls && npm run build  # Rebuild
```

### Database connection error?
```bash
mysql -u khyber_user -p khybershawls  # Test connection
nano ~/khyber-shawls/.env  # Check DATABASE_URL
```

### 502 Bad Gateway?
```bash
pm2 status  # Ensure app is running
sudo tail -f /var/log/nginx/error.log  # Check Nginx logs
```

---

## 📦 What's Included

```
deployment/
├── README.md              # Full deployment guide
├── QUICKSTART.md          # This file
├── vps-setup.sh          # Automated VPS setup
├── ecosystem.config.js   # PM2 configuration
├── nginx.conf            # Nginx configuration
├── backup-db.sh          # Database backup script
├── backup-uploads.sh     # Files backup script
└── deploy.sh             # Update deployment script
```

---

## 🎯 Next Steps After Deployment

1. **Test the site**: Visit https://yourdomain.com
2. **Login as admin**: Use credentials from your database
3. **Upload products**: Through admin panel
4. **Setup monitoring**: UptimeRobot, Pingdom, etc.
5. **Configure backups**: Already automated!
6. **Add analytics**: Google Analytics, Facebook Pixel
7. **Test payments**: If using Stripe

---

## 📞 Need Help?

- **Documentation**: See [deployment/README.md](./deployment/README.md)
- **Logs**: `pm2 logs khyber-shawls`
- **Status**: `pm2 status`
- **GitHub**: Open an issue

---

**Deployment Time**: ~15 minutes  
**Estimated Cost**: $5-20/month (VPS + domain)  
**Difficulty**: ⭐⭐☆☆☆

Good luck! 🚀
