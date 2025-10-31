#!/bin/bash

#######################################
# File Uploads Backup Script
# Backs up uploaded files to ~/backups/
#######################################

# Configuration
APP_DIR="$HOME/khyber-shawls"
UPLOADS_DIR="$APP_DIR/public/uploads"
BACKUP_DIR="$HOME/backups/uploads"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if uploads directory exists
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "Uploads directory not found: $UPLOADS_DIR"
    exit 1
fi

# Create backup
echo "Starting uploads backup..."
tar -czf "$BACKUP_FILE" -C "$APP_DIR/public" uploads

if [ $? -eq 0 ]; then
    echo "Uploads backup successful: $BACKUP_FILE"
    
    # Delete backups older than 30 days
    find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +30 -delete
    echo "Old backups cleaned up (keeping last 30 days)"
    
    # Show disk usage
    du -sh "$BACKUP_DIR"
else
    echo "Uploads backup failed!"
    exit 1
fi

echo "Backup completed at $(date)"
