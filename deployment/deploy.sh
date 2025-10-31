#!/bin/bash

#######################################
# Automated Deployment Script
# Pulls latest changes and restarts app
#######################################

set -e  # Exit on any error

APP_DIR="$HOME/khyber-shawls"
APP_NAME="khyber-shawls"

echo "=========================================="
echo "Starting deployment for $APP_NAME"
echo "=========================================="

# Navigate to app directory
cd "$APP_DIR"

# Show current branch and commit
echo "Current branch: $(git branch --show-current)"
echo "Current commit: $(git rev-parse --short HEAD)"

# Pull latest changes
echo ""
echo "Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "Git pull failed! Aborting deployment."
    exit 1
fi

# Show new commit
echo "New commit: $(git rev-parse --short HEAD)"

# Install/update dependencies
echo ""
echo "Installing dependencies..."
npm ci --production=false

# Run database migrations
echo ""
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo ""
echo "Generating Prisma Client..."
npx prisma generate

# Build application
echo ""
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed! Aborting deployment."
    exit 1
fi

# Restart application with PM2
echo ""
echo "Restarting application..."
pm2 restart "$APP_NAME"

if [ $? -ne 0 ]; then
    echo "PM2 restart failed! Attempting to start..."
    pm2 start ecosystem.config.js
fi

# Show application status
echo ""
echo "Application status:"
pm2 status "$APP_NAME"

# Save PM2 configuration
pm2 save

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Check logs with: pm2 logs $APP_NAME"
echo "Check status with: pm2 status"
echo ""
