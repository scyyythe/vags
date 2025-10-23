# VAGS Backup System

This directory contains comprehensive backup scripts for the VAGS system that will **NOT** affect your running application or database.

## 🚀 Quick Start

1. **Setup the backup system:**
   ```bash
   cd backend/backup_scripts
   chmod +x cron_setup.sh
   ./cron_setup.sh
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.backup.template .env.backup
   # Edit .env.backup with your actual values
   ```

3. **Test the backup system:**
   ```bash
   ./test_backup.sh
   ```

4. **Install automated backups:**
   ```bash
   ./install_cron.sh
   ```

## 📁 Files Overview

### Core Backup Scripts

- **`mongodb_backup.py`** - MongoDB database backup and restore
- **`file_backup.py`** - File and media backup system
- **`automated_backup.py`** - Orchestrates all backup operations
- **`cron_setup.sh`** - Sets up automated backup scheduling

### Setup and Testing

- **`test_backup.sh`** - Test all backup functions
- **`install_cron.sh`** - Install cron jobs for automation
- **`.env.backup.template`** - Environment variables template

## 🔧 Manual Backup Commands

### Database Backup
```bash
# Create database backup
python3 mongodb_backup.py backup

# List available backups
python3 mongodb_backup.py list

# Restore database backup
python3 mongodb_backup.py restore --file backups/mongodb/vags_backup_20240101_120000.tar.gz
```

### File Backup
```bash
# Create file backup
python3 file_backup.py backup

# List available backups
python3 file_backup.py list

# Restore file backup
python3 file_backup.py restore --file backups/files/vags_files_backup_20240101_120000.tar.gz
```

### Automated Backup
```bash
# Run full backup (database + files)
python3 automated_backup.py full

# Run database backup only
python3 automated_backup.py database

# Run file backup only
python3 automated_backup.py files

# Check backup status
python3 automated_backup.py status
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.backup` file with the following variables:

```bash
# MongoDB Configuration
MONGO_DB_URI=mongodb://localhost:27017
MONGO_DB_NAME=vags_db

# Cloudinary Configuration (for file backup)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Notification Configuration (optional)
BACKUP_EMAIL_ENABLED=false
BACKUP_SMTP_SERVER=smtp.gmail.com
BACKUP_SMTP_PORT=587
BACKUP_EMAIL_USER=your_email@gmail.com
BACKUP_EMAIL_PASSWORD=your_app_password
BACKUP_TO_EMAIL=admin@yourcompany.com
BACKUP_FROM_EMAIL=your_email@gmail.com

# Django Settings
DJANGO_SETTINGS_MODULE=backend.settings
```

## 📅 Automated Scheduling

The system includes pre-configured cron jobs:

- **Daily Full Backup**: 2:00 AM every day
- **Weekly Database Backup**: 3:00 AM every Sunday
- **Monthly File Backup**: 4:00 AM on the 1st of each month

### Install Cron Jobs
```bash
./install_cron.sh
```

### View Cron Jobs
```bash
crontab -l
```

### Remove Cron Jobs
```bash
crontab -r
```

## 🔒 Security Features

- **Non-Intrusive**: Scripts run independently and don't affect your running system
- **Compressed Backups**: All backups are compressed to save space
- **Retention Policy**: Automatic cleanup of old backups (30 days default)
- **Email Notifications**: Optional email alerts for backup status
- **Metadata Tracking**: Each backup includes metadata for tracking

## 📊 Backup Locations

- **Database Backups**: `backups/mongodb/`
- **File Backups**: `backups/files/`
- **Logs**: `backups/logs/`
- **Metadata**: Included with each backup

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Tools Not Found**
   ```bash
   # Install MongoDB tools
   # Ubuntu/Debian:
   sudo apt-get install mongodb-database-tools
   
   # macOS:
   brew install mongodb/brew/mongodb-database-tools
   ```

2. **Permission Denied**
   ```bash
   # Make scripts executable
   chmod +x *.py *.sh
   ```

3. **Environment Variables Not Loaded**
   ```bash
   # Ensure .env.backup file exists and has correct values
   cp .env.backup.template .env.backup
   # Edit .env.backup with your values
   ```

### Log Files

- **Main Log**: `automated_backup.log`
- **MongoDB Log**: `backup.log`
- **File Backup Log**: `file_backup.log`
- **Cron Logs**: `backups/logs/`

## 📈 Monitoring

### Check Backup Status
```bash
python3 automated_backup.py status
```

### View Recent Backups
```bash
# Database backups
python3 mongodb_backup.py list

# File backups
python3 file_backup.py list
```

### Monitor Logs
```bash
# View recent backup logs
tail -f automated_backup.log
tail -f backup.log
tail -f file_backup.log
```

## 🔄 Recovery Procedures

### Database Recovery
1. Stop your application (if needed)
2. Run restore command:
   ```bash
   python3 mongodb_backup.py restore --file path/to/backup.tar.gz
   ```
3. Restart your application

### File Recovery
1. Run restore command:
   ```bash
   python3 file_backup.py restore --file path/to/backup.tar.gz --target /path/to/restore/location
   ```

## 📝 Best Practices

1. **Test Backups Regularly**: Run `./test_backup.sh` regularly
2. **Monitor Backup Status**: Check backup logs and status
3. **Verify Restore Process**: Test restore procedures periodically
4. **Keep Multiple Backup Copies**: Store backups in different locations
5. **Document Recovery Procedures**: Keep recovery steps documented

## 🆘 Emergency Recovery

In case of system failure:

1. **Check Available Backups**:
   ```bash
   python3 automated_backup.py status
   ```

2. **Restore Database**:
   ```bash
   python3 mongodb_backup.py restore --file latest_database_backup.tar.gz
   ```

3. **Restore Files**:
   ```bash
   python3 file_backup.py restore --file latest_file_backup.tar.gz
   ```

4. **Verify System**:
   ```bash
   # Test your application
   # Check data integrity
   # Monitor system logs
   ```

## 📞 Support

If you encounter issues:

1. Check the log files for error messages
2. Verify environment variables are correct
3. Ensure required tools (mongodump, mongorestore) are installed
4. Test backup system manually before relying on automation

---

**Important**: These backup scripts are designed to be completely non-intrusive and will not affect your running VAGS system. They can be safely run alongside your application.
