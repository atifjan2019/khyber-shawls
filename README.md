# Khyber Shawls E-Commerce Platform

A full-featured e-commerce platform built with Next.js 16, featuring dynamic product categories, admin dashboard, and integrated payment processing.

## ✨ Features

- 🛍️ **Dynamic Product Categories** - Fully customizable category pages with intro sections and content blocks
- 📦 **Product Management** - Complete CRUD operations with image galleries and variants
- 👥 **User Authentication** - Secure login/signup with NextAuth.js
- 🔐 **Admin Dashboard** - Comprehensive admin panel for managing products, categories, orders, and users
- 🛒 **Shopping Cart** - Persistent cart with localStorage sync
- 💳 **Payment Integration** - Stripe payment processing (configurable)
- 📧 **Contact Forms** - Customer inquiry management
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🖼️ **Image Management** - File upload system for products and categories
- 🔍 **SEO Optimized** - Dynamic meta tags and sitemap generation

## 🚀 Quick Deploy to VPS

**Get live in 15 minutes!** See our [Quick Start Guide](./deployment/QUICKSTART.md)

```bash
# On your Hostinger VPS (as root)
wget https://raw.githubusercontent.com/webspires-eng/khyber-shawls/main/deployment/vps-setup.sh
chmod +x vps-setup.sh && ./vps-setup.sh
```

For complete deployment instructions, see [deployment/README.md](./deployment/README.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Context API
- **File Uploads**: Node.js file system
- **Payments**: Stripe (optional)
- **Email**: SMTP integration

## 📋 Prerequisites

- Node.js 18+ or 20 LTS
- MySQL 8.0+
- npm or yarn

## 🏃 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/webspires-eng/khyber-shawls.git
cd khyber-shawls
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="mysql://user:password@localhost:3306/khybershawls"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### 4. Setup database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🗂️ Project Structure

```
khyber-shawls/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── category/          # Dynamic category pages
│   ├── products/          # Product pages
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── product/          # Product components
│   ├── shop/             # Shop components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
│   └── uploads/          # User-uploaded images
├── deployment/           # Deployment configurations
│   ├── QUICKSTART.md    # Quick deploy guide
│   ├── README.md        # Full deployment guide
│   └── ...
└── ...
```

## 🔑 Environment Variables

See [.env.example](./env.example) for all available options.

Key variables:
- `DATABASE_URL` - MySQL connection string
- `NEXTAUTH_URL` - Your site URL
- `NEXTAUTH_SECRET` - Secret for session encryption
- `SMTP_*` - Email configuration (optional)
- `STRIPE_*` - Payment configuration (optional)

## 🚢 Deployment Options

### Option 1: Hostinger VPS (Recommended)
- **Cost**: $5-20/month
- **Guide**: [deployment/QUICKSTART.md](./deployment/QUICKSTART.md)
- **Time**: ~15 minutes
- **Includes**: PM2, Nginx, SSL, backups

### Option 2: Vercel
- Deploy with one click
- Requires serverless-compatible database
- See [Vercel deployment docs](https://nextjs.org/docs/app/building-your-application/deploying)

### Option 3: Other VPS/Cloud
- Follow [deployment/README.md](./deployment/README.md)
- Works on DigitalOcean, AWS, Azure, etc.

## 🔄 CI/CD

Automatic deployment on push to `main`:

1. Add GitHub Secrets:
   - `VPS_HOST`
   - `VPS_USERNAME`
   - `VPS_SSH_KEY`
   - `VPS_PORT`

2. Push to `main` → Auto-deploy! ✨

See [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)

## 📝 Documentation

- [Quick Start Guide](./deployment/QUICKSTART.md) - Deploy in 15 minutes
- [Full Deployment Guide](./deployment/README.md) - Complete instructions
- [Category Content Guide](./CATEGORY_CONTENT_GUIDE.md) - Managing dynamic categories
- [Image Security Guide](./IMAGE_URL_SECURITY_FIX.md) - Image upload security

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

- **Documentation**: Check [deployment/](./deployment/) folder
- **Logs**: `pm2 logs khyber-shawls` (production)
- **Issues**: Open a GitHub issue
- **Email**: Contact the development team

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced product filtering
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Newsletter integration
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Discount codes and promotions

---

Built with ❤️ using Next.js

**Ready to deploy?** → [Start here](./deployment/QUICKSTART.md) 🚀
