#!/bin/bash

#######################################
# MySQL Database Backup Script
# Backs up the database to ~/backups/
#######################################

# Configuration - UPDATE THESE VALUES
DB_NAME="khybershawls"
DB_USER="khyber_user"
DB_PASS="your_strong_password"
DB_HOST="localhost"

# Backup directory
BACKUP_DIR="$HOME/backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Starting database backup..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Database backup successful: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Delete backups older than 30 days
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete
    echo "Old backups cleaned up (keeping last 30 days)"
    
    # Show disk usage
    du -sh "$BACKUP_DIR"
else
    echo "Database backup failed!"
    exit 1
fi

echo "Backup completed at $(date)"
