#!/usr/bin/env python3
"""
Automated Backup System for VAGS
This script orchestrates all backup operations and can be run via cron
"""

import os
import sys
import datetime
import logging
import json
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from pathlib import Path
from typing import Dict, List, Optional

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongodb_backup import MongoDBBackup
from file_backup import FileBackup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('automated_backup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutomatedBackup:
    def __init__(self):
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        
        # Initialize backup tools
        self.mongo_backup = MongoDBBackup()
        self.file_backup = FileBackup()
        
        # Email configuration (optional)
        self.email_config = {
            "enabled": os.getenv("BACKUP_EMAIL_ENABLED", "false").lower() == "true",
            "smtp_server": os.getenv("BACKUP_SMTP_SERVER", ""),
            "smtp_port": int(os.getenv("BACKUP_SMTP_PORT", "587")),
            "username": os.getenv("BACKUP_EMAIL_USER", ""),
            "password": os.getenv("BACKUP_EMAIL_PASSWORD", ""),
            "to_email": os.getenv("BACKUP_TO_EMAIL", ""),
            "from_email": os.getenv("BACKUP_FROM_EMAIL", "")
        }
    
    def run_full_backup(self, send_email: bool = True) -> Dict[str, any]:
        """
        Run a full backup including database and files
        Returns a summary of the backup operation
        """
        logger.info("Starting full backup operation...")
        
        backup_summary = {
            "start_time": datetime.datetime.now().isoformat(),
            "database_backup": None,
            "file_backup": None,
            "success": False,
            "errors": []
        }
        
        try:
            # Database backup
            logger.info("Creating database backup...")
            db_backup_path = self.mongo_backup.create_backup()
            if db_backup_path:
                backup_summary["database_backup"] = {
                    "success": True,
                    "path": db_backup_path,
                    "size": Path(db_backup_path).stat().st_size if Path(db_backup_path).exists() else 0
                }
                logger.info(f"Database backup completed: {db_backup_path}")
            else:
                backup_summary["database_backup"] = {"success": False, "error": "Database backup failed"}
                backup_summary["errors"].append("Database backup failed")
                logger.error("Database backup failed")
            
            # File backup
            logger.info("Creating file backup...")
            file_backup_path = self.file_backup.create_file_backup()
            if file_backup_path:
                backup_summary["file_backup"] = {
                    "success": True,
                    "path": file_backup_path,
                    "size": Path(file_backup_path).stat().st_size if Path(file_backup_path).exists() else 0
                }
                logger.info(f"File backup completed: {file_backup_path}")
            else:
                backup_summary["file_backup"] = {"success": False, "error": "File backup failed"}
                backup_summary["errors"].append("File backup failed")
                logger.error("File backup failed")
            
            # Determine overall success
            backup_summary["success"] = (
                backup_summary["database_backup"]["success"] and 
                backup_summary["file_backup"]["success"]
            )
            
            backup_summary["end_time"] = datetime.datetime.now().isoformat()
            
            # Save backup summary
            self._save_backup_summary(backup_summary)
            
            # Send email notification if configured
            if send_email and self.email_config["enabled"]:
                self._send_backup_notification(backup_summary)
            
            logger.info(f"Full backup operation completed. Success: {backup_summary['success']}")
            return backup_summary
            
        except Exception as e:
            logger.error(f"Full backup failed with error: {str(e)}")
            backup_summary["errors"].append(str(e))
            backup_summary["end_time"] = datetime.datetime.now().isoformat()
            self._save_backup_summary(backup_summary)
            return backup_summary
    
    def run_database_backup_only(self) -> Dict[str, any]:
        """Run database backup only"""
        logger.info("Starting database backup only...")
        
        backup_summary = {
            "start_time": datetime.datetime.now().isoformat(),
            "database_backup": None,
            "success": False,
            "errors": []
        }
        
        try:
            db_backup_path = self.mongo_backup.create_backup()
            if db_backup_path:
                backup_summary["database_backup"] = {
                    "success": True,
                    "path": db_backup_path,
                    "size": Path(db_backup_path).stat().st_size if Path(db_backup_path).exists() else 0
                }
                backup_summary["success"] = True
                logger.info(f"Database backup completed: {db_backup_path}")
            else:
                backup_summary["database_backup"] = {"success": False, "error": "Database backup failed"}
                backup_summary["errors"].append("Database backup failed")
                logger.error("Database backup failed")
            
            backup_summary["end_time"] = datetime.datetime.now().isoformat()
            self._save_backup_summary(backup_summary)
            
            return backup_summary
            
        except Exception as e:
            logger.error(f"Database backup failed with error: {str(e)}")
            backup_summary["errors"].append(str(e))
            backup_summary["end_time"] = datetime.datetime.now().isoformat()
            self._save_backup_summary(backup_summary)
            return backup_summary
    
    def run_file_backup_only(self) -> Dict[str, any]:
        """Run file backup only"""
        logger.info("Starting file backup only...")
        
        backup_summary = {
            "start_time": datetime.datetime.now().isoformat(),
            "file_backup": None,
            "success": False,
            "errors": []
        }
        
        try:
            file_backup_path = self.file_backup.create_file_backup()
            if file_backup_path:
                backup_summary["file_backup"] = {
                    "success": True,
                    "path": file_backup_path,
                    "size": Path(file_backup_path).stat().st_size if Path(file_backup_path).exists() else 0
                }
                backup_summary["success"] = True
                logger.info(f"File backup completed: {file_backup_path}")
            else:
                backup_summary["file_backup"] = {"success": False, "error": "File backup failed"}
                backup_summary["errors"].append("File backup failed")
                logger.error("File backup failed")
            
            backup_summary["end_time"] = datetime.datetime.now().isoformat()
            self._save_backup_summary(backup_summary)
            
            return backup_summary
            
        except Exception as e:
            logger.error(f"File backup failed with error: {str(e)}")
            backup_summary["errors"].append(str(e))
            backup_summary["end_time"] = datetime.datetime.now().isoformat()
            self._save_backup_summary(backup_summary)
            return backup_summary
    
    def _save_backup_summary(self, summary: Dict):
        """Save backup summary to file"""
        try:
            summary_file = self.backup_dir / f"backup_summary_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(summary_file, 'w') as f:
                json.dump(summary, f, indent=2)
            logger.info(f"Backup summary saved: {summary_file}")
        except Exception as e:
            logger.error(f"Failed to save backup summary: {e}")
    
    def _send_backup_notification(self, backup_summary: Dict):
        """Send email notification about backup status"""
        if not self.email_config["enabled"] or not all([
            self.email_config["smtp_server"],
            self.email_config["username"],
            self.email_config["password"],
            self.email_config["to_email"]
        ]):
            logger.warning("Email notification not configured properly")
            return
        
        try:
            # Create email content
            subject = f"VAGS Backup Report - {'SUCCESS' if backup_summary['success'] else 'FAILED'}"
            
            # Format email body
            body = f"""
VAGS Backup Report
==================

Backup Date: {backup_summary['start_time']}
Status: {'SUCCESS' if backup_summary['success'] else 'FAILED'}

Database Backup:
- Status: {'SUCCESS' if backup_summary['database_backup']['success'] else 'FAILED'}
- Path: {backup_summary['database_backup'].get('path', 'N/A')}
- Size: {backup_summary['database_backup'].get('size', 0) / (1024*1024):.2f} MB

File Backup:
- Status: {'SUCCESS' if backup_summary['file_backup']['success'] else 'FAILED'}
- Path: {backup_summary['file_backup'].get('path', 'N/A')}
- Size: {backup_summary['file_backup'].get('size', 0) / (1024*1024):.2f} MB

Errors:
{chr(10).join(backup_summary['errors']) if backup_summary['errors'] else 'None'}

End Time: {backup_summary['end_time']}
            """
            
            # Send email
            msg = MimeMultipart()
            msg['From'] = self.email_config["from_email"]
            msg['To'] = self.email_config["to_email"]
            msg['Subject'] = subject
            
            msg.attach(MimeText(body, 'plain'))
            
            server = smtplib.SMTP(self.email_config["smtp_server"], self.email_config["smtp_port"])
            server.starttls()
            server.login(self.email_config["username"], self.email_config["password"])
            text = msg.as_string()
            server.sendmail(self.email_config["from_email"], self.email_config["to_email"], text)
            server.quit()
            
            logger.info("Backup notification email sent successfully")
            
        except Exception as e:
            logger.error(f"Failed to send backup notification email: {e}")
    
    def get_backup_status(self) -> Dict:
        """Get current backup status and statistics"""
        try:
            # Get database backups
            db_backups = self.mongo_backup.list_backups()
            
            # Get file backups
            file_backups = self.file_backup.list_backups()
            
            # Calculate total backup size
            total_size = 0
            for backup in db_backups:
                total_size += backup.get('size', 0)
            for backup in file_backups:
                total_size += backup.get('size', 0)
            
            status = {
                "database_backups": len(db_backups),
                "file_backups": len(file_backups),
                "total_backups": len(db_backups) + len(file_backups),
                "total_size_mb": total_size / (1024 * 1024),
                "latest_database_backup": db_backups[0] if db_backups else None,
                "latest_file_backup": file_backups[0] if file_backups else None
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get backup status: {e}")
            return {"error": str(e)}

def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="VAGS Automated Backup System")
    parser.add_argument("action", choices=["full", "database", "files", "status"], help="Backup action to perform")
    parser.add_argument("--no-email", action="store_true", help="Don't send email notification")
    
    args = parser.parse_args()
    
    backup_system = AutomatedBackup()
    
    if args.action == "full":
        logger.info("Running full backup...")
        result = backup_system.run_full_backup(send_email=not args.no_email)
        if result["success"]:
            print("Full backup completed successfully!")
        else:
            print(f"Full backup failed with errors: {result['errors']}")
            sys.exit(1)
    
    elif args.action == "database":
        logger.info("Running database backup...")
        result = backup_system.run_database_backup_only()
        if result["success"]:
            print("Database backup completed successfully!")
        else:
            print(f"Database backup failed with errors: {result['errors']}")
            sys.exit(1)
    
    elif args.action == "files":
        logger.info("Running file backup...")
        result = backup_system.run_file_backup_only()
        if result["success"]:
            print("File backup completed successfully!")
        else:
            print(f"File backup failed with errors: {result['errors']}")
            sys.exit(1)
    
    elif args.action == "status":
        status = backup_system.get_backup_status()
        if "error" in status:
            print(f"Error getting backup status: {status['error']}")
            sys.exit(1)
        
        print("\nVAGS Backup Status")
        print("=" * 50)
        print(f"Database Backups: {status['database_backups']}")
        print(f"File Backups: {status['file_backups']}")
        print(f"Total Backups: {status['total_backups']}")
        print(f"Total Size: {status['total_size_mb']:.2f} MB")
        
        if status['latest_database_backup']:
            print(f"\nLatest Database Backup:")
            print(f"  File: {status['latest_database_backup']['filename']}")
            print(f"  Date: {status['latest_database_backup']['created']}")
            print(f"  Size: {status['latest_database_backup']['size'] / (1024*1024):.2f} MB")
        
        if status['latest_file_backup']:
            print(f"\nLatest File Backup:")
            print(f"  File: {status['latest_file_backup']['filename']}")
            print(f"  Date: {status['latest_file_backup']['created']}")
            print(f"  Size: {status['latest_file_backup']['size'] / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
