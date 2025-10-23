#!/bin/bash

# VAGS Backup System - Cron Setup Script
# This script helps you set up automated backups using cron

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}VAGS Backup System - Cron Setup${NC}"
echo "=================================="

# Get the current directory (where backup scripts are located)
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$BACKUP_DIR")"

echo -e "${YELLOW}Backup directory: $BACKUP_DIR${NC}"
echo -e "${YELLOW}Project root: $PROJECT_ROOT${NC}"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required but not installed.${NC}"
    exit 1
fi

# Check if required tools are available
echo "Checking required tools..."

# Check for mongodump
if ! command -v mongodump &> /dev/null; then
    echo -e "${RED}Warning: mongodump not found. MongoDB backup will not work.${NC}"
    echo "Please install MongoDB tools or ensure mongodump is in your PATH."
fi

# Check for mongorestore
if ! command -v mongorestore &> /dev/null; then
    echo -e "${RED}Warning: mongorestore not found. MongoDB restore will not work.${NC}"
    echo "Please install MongoDB tools or ensure mongorestore is in your PATH."
fi

# Make backup scripts executable
echo "Making backup scripts executable..."
chmod +x "$BACKUP_DIR/mongodb_backup.py"
chmod +x "$BACKUP_DIR/file_backup.py"
chmod +x "$BACKUP_DIR/automated_backup.py"

# Create backup directories
echo "Creating backup directories..."
mkdir -p "$PROJECT_ROOT/backups/mongodb"
mkdir -p "$PROJECT_ROOT/backups/files"
mkdir -p "$PROJECT_ROOT/backups/logs"

# Set up environment file template
ENV_TEMPLATE="$BACKUP_DIR/.env.backup.template"
if [ ! -f "$ENV_TEMPLATE" ]; then
    echo "Creating environment template..."
    cat > "$ENV_TEMPLATE" << EOF
# VAGS Backup System Environment Variables
# Copy this file to .env.backup and fill in your values

# MongoDB Configuration
MONGO_DB_URI=mongodb+srv://canete:Canete062723%21@cluster0.lngnj.mongodb.net/virtual_art?retryWrites=true&w=majority&authSource=admin

MONGO_DB_NAME=virtual_art

# Cloudinary Configuration (for file backup)
CLOUDINARY_CLOUD_NAME=du5bwye4h
CLOUDINARY_API_KEY=198339479569966
CLOUDINARY_API_SECRET=4_W00AnLs0GAA-nyv1E0Q8AcTts

# Email Notification Configuration (optional)
BACKUP_EMAIL_ENABLED=false
BACKUP_SMTP_SERVER=smtp.gmail.com
BACKUP_SMTP_PORT=587
BACKUP_EMAIL_USER=caneteangel327@gmail.com
BACKUP_EMAIL_PASSWORD=wwkb edfo uvst gfqz
BACKUP_TO_EMAIL=caneteangel327@gmail.com
BACKUP_FROM_EMAIL=caneteangel327@gmail.com

# Django Settings
DJANGO_SETTINGS_MODULE=backend.settings
EOF
    echo -e "${GREEN}Environment template created: $ENV_TEMPLATE${NC}"
fi

# Create cron job templates
echo "Creating cron job templates..."

# Daily full backup at 2 AM
DAILY_CRON="$BACKUP_DIR/cron_daily_backup.sh"
cat > "$DAILY_CRON" << EOF
#!/bin/bash
# Daily full backup - runs at 2:00 AM

# Set working directory
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f "$BACKUP_DIR/.env.backup" ]; then
    export \$(cat "$BACKUP_DIR/.env.backup" | grep -v '^#' | xargs)
fi

# Run full backup
python3 "$BACKUP_DIR/automated_backup.py" full --no-email >> "$PROJECT_ROOT/backups/logs/daily_backup.log" 2>&1
EOF

# Weekly database backup at 3 AM on Sundays
WEEKLY_CRON="$BACKUP_DIR/cron_weekly_database.sh"
cat > "$WEEKLY_CRON" << EOF
#!/bin/bash
# Weekly database backup - runs at 3:00 AM on Sundays

# Set working directory
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f "$BACKUP_DIR/.env.backup" ]; then
    export \$(cat "$BACKUP_DIR/.env.backup" | grep -v '^#' | xargs)
fi

# Run database backup only
python3 "$BACKUP_DIR/automated_backup.py" database --no-email >> "$PROJECT_ROOT/backups/logs/weekly_database.log" 2>&1
EOF

# Monthly file backup at 4 AM on the 1st
MONTHLY_CRON="$BACKUP_DIR/cron_monthly_files.sh"
cat > "$MONTHLY_CRON" << EOF
#!/bin/bash
# Monthly file backup - runs at 4:00 AM on the 1st of each month

# Set working directory
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f "$BACKUP_DIR/.env.backup" ]; then
    export \$(cat "$BACKUP_DIR/.env.backup" | grep -v '^#' | xargs)
fi

# Run file backup only
python3 "$BACKUP_DIR/automated_backup.py" files --no-email >> "$PROJECT_ROOT/backups/logs/monthly_files.log" 2>&1
EOF

# Make cron scripts executable
chmod +x "$DAILY_CRON"
chmod +x "$WEEKLY_CRON"
chmod +x "$MONTHLY_CRON"

echo -e "${GREEN}Cron job templates created successfully!${NC}"

# Display cron job setup instructions
echo ""
echo -e "${YELLOW}Cron Job Setup Instructions:${NC}"
echo "================================"
echo ""
echo "To set up automated backups, add these lines to your crontab:"
echo ""
echo "# Daily full backup at 2:00 AM"
echo "0 2 * * * $DAILY_CRON"
echo ""
echo "# Weekly database backup at 3:00 AM on Sundays"
echo "0 3 * * 0 $WEEKLY_CRON"
echo ""
echo "# Monthly file backup at 4:00 AM on the 1st of each month"
echo "0 4 1 * * $MONTHLY_CRON"
echo ""
echo "To edit your crontab, run: crontab -e"
echo ""

# Create a setup script for easy cron installation
SETUP_SCRIPT="$BACKUP_DIR/install_cron.sh"
cat > "$SETUP_SCRIPT" << EOF
#!/bin/bash

# Install VAGS backup cron jobs

echo "Installing VAGS backup cron jobs..."

# Add cron jobs
(crontab -l 2>/dev/null; echo "# VAGS Backup System"; echo "0 2 * * * $DAILY_CRON"; echo "0 3 * * 0 $WEEKLY_CRON"; echo "0 4 1 * * $MONTHLY_CRON") | crontab -

echo "Cron jobs installed successfully!"
echo "To view your crontab: crontab -l"
echo "To remove all cron jobs: crontab -r"
EOF

chmod +x "$SETUP_SCRIPT"

echo -e "${GREEN}Setup script created: $SETUP_SCRIPT${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "============"
echo "1. Copy $ENV_TEMPLATE to $BACKUP_DIR/.env.backup"
echo "2. Edit $BACKUP_DIR/.env.backup with your actual values"
echo "3. Run $SETUP_SCRIPT to install cron jobs"
echo "4. Test the backup system manually first:"
echo "   python3 $BACKUP_DIR/automated_backup.py status"
echo "   python3 $BACKUP_DIR/automated_backup.py full"
echo ""

# Create a test script
TEST_SCRIPT="$BACKUP_DIR/test_backup.sh"
cat > "$TEST_SCRIPT" << EOF
#!/bin/bash

# Test VAGS backup system

echo "Testing VAGS backup system..."

# Set working directory
cd "$PROJECT_ROOT"

# Load environment variables
if [ -f "$BACKUP_DIR/.env.backup" ]; then
    export \$(cat "$BACKUP_DIR/.env.backup" | grep -v '^#' | xargs)
fi

echo "1. Testing backup status..."
python3 "$BACKUP_DIR/automated_backup.py" status

echo ""
echo "2. Testing file backup..."
python3 "$BACKUP_DIR/automated_backup.py" files

echo ""
echo "3. Testing database backup..."
python3 "$BACKUP_DIR/automated_backup.py" database

echo ""
echo "4. Testing full backup..."
python3 "$BACKUP_DIR/automated_backup.py" full

echo ""
echo "Backup test completed!"
EOF

chmod +x "$TEST_SCRIPT"

echo -e "${GREEN}Test script created: $TEST_SCRIPT${NC}"
echo ""
echo -e "${GREEN}Setup completed successfully!${NC}"
echo ""
echo "Run '$TEST_SCRIPT' to test your backup system."
