#!/usr/bin/env python3
"""
MongoDB Backup Script for VAGS System
This script creates automated backups of your MongoDB database
without affecting the running system.
"""

import os
import subprocess
import datetime
import logging
import json
import gzip
import shutil
from pathlib import Path
from typing import Optional, List
import sys

# Add the parent directory to the path to import Django settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.conf import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MongoDBBackup:
    def __init__(self):
        self.backup_dir = Path("backups/mongodb")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.retention_days = 30  # Keep backups for 30 days
        
    def create_backup(self, compress: bool = True) -> Optional[str]:
        """
        Create a MongoDB backup
        Returns the backup file path if successful, None otherwise
        """
        try:
            # Get MongoDB connection details from environment
            mongo_uri = os.getenv("MONGO_DB_URI")
            db_name = os.getenv("MONGO_DB_NAME")
            
            if not mongo_uri or not db_name:
                logger.error("MongoDB URI or DB name not found in environment variables")
                return None
            
            # Create timestamp for backup
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vags_backup_{timestamp}"
            backup_path = self.backup_dir / backup_filename
            
            logger.info(f"Starting MongoDB backup for database: {db_name}")
            
            # Create mongodump command
            cmd = [
                "mongodump",
                "--uri", mongo_uri,
                "--db", db_name,
                "--out", str(backup_path)
            ]
            
            # Execute mongodump
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                logger.error(f"mongodump failed: {result.stderr}")
                return None
            
            logger.info(f"MongoDB backup created successfully: {backup_path}")
            
            # Compress backup if requested
            if compress:
                compressed_path = f"{backup_path}.tar.gz"
                logger.info(f"Compressing backup to: {compressed_path}")
                
                # Create tar.gz archive
                tar_cmd = ["tar", "-czf", compressed_path, "-C", str(self.backup_dir), backup_filename]
                tar_result = subprocess.run(tar_cmd, capture_output=True, text=True)
                
                if tar_result.returncode == 0:
                    # Remove uncompressed backup
                    shutil.rmtree(backup_path)
                    backup_path = Path(compressed_path)
                    logger.info(f"Backup compressed successfully: {backup_path}")
                else:
                    logger.warning(f"Compression failed: {tar_result.stderr}")
            
            # Create backup metadata
            self._create_backup_metadata(backup_path, db_name)
            
            # Clean old backups
            self._cleanup_old_backups()
            
            return str(backup_path)
            
        except Exception as e:
            logger.error(f"Backup failed with error: {str(e)}")
            return None
    
    def _create_backup_metadata(self, backup_path: Path, db_name: str):
        """Create metadata file for the backup"""
        metadata = {
            "backup_date": datetime.datetime.now().isoformat(),
            "database_name": db_name,
            "backup_file": str(backup_path),
            "backup_size": backup_path.stat().st_size if backup_path.exists() else 0,
            "system_info": {
                "hostname": os.uname().nodename if hasattr(os, 'uname') else "unknown",
                "python_version": sys.version,
            }
        }
        
        metadata_path = backup_path.parent / f"{backup_path.name}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Backup metadata created: {metadata_path}")
    
    def _cleanup_old_backups(self):
        """Remove backups older than retention period"""
        try:
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=self.retention_days)
            
            for backup_file in self.backup_dir.glob("vags_backup_*"):
                if backup_file.is_file() or backup_file.is_dir():
                    file_time = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
                    
                    if file_time < cutoff_date:
                        logger.info(f"Removing old backup: {backup_file}")
                        if backup_file.is_file():
                            backup_file.unlink()
                        else:
                            shutil.rmtree(backup_file)
                        
                        # Also remove metadata file
                        metadata_file = backup_file.parent / f"{backup_file.name}_metadata.json"
                        if metadata_file.exists():
                            metadata_file.unlink()
                            
        except Exception as e:
            logger.error(f"Error cleaning up old backups: {str(e)}")
    
    def list_backups(self) -> List[dict]:
        """List all available backups with metadata"""
        backups = []
        
        for backup_file in self.backup_dir.glob("vags_backup_*"):
            if backup_file.name.endswith('_metadata.json'):
                continue
                
            metadata_file = backup_file.parent / f"{backup_file.name}_metadata.json"
            
            backup_info = {
                "filename": backup_file.name,
                "path": str(backup_file),
                "size": backup_file.stat().st_size if backup_file.exists() else 0,
                "created": datetime.datetime.fromtimestamp(backup_file.stat().st_mtime).isoformat(),
                "has_metadata": metadata_file.exists()
            }
            
            if metadata_file.exists():
                try:
                    with open(metadata_file, 'r') as f:
                        backup_info.update(json.load(f))
                except Exception as e:
                    logger.warning(f"Could not read metadata for {backup_file}: {e}")
            
            backups.append(backup_info)
        
        return sorted(backups, key=lambda x: x['created'], reverse=True)
    
    def restore_backup(self, backup_path: str, target_db: Optional[str] = None) -> bool:
        """
        Restore a MongoDB backup
        WARNING: This will overwrite the target database
        """
        try:
            backup_path = Path(backup_path)
            
            if not backup_path.exists():
                logger.error(f"Backup file not found: {backup_path}")
                return False
            
            # Get target database name
            if not target_db:
                target_db = os.getenv("MONGO_DB_NAME")
            
            if not target_db:
                logger.error("Target database name not specified")
                return False
            
            logger.warning(f"WARNING: This will overwrite database '{target_db}'")
            logger.info(f"Restoring backup: {backup_path}")
            
            # Handle compressed backups
            restore_path = backup_path
            temp_extracted = None
            
            if backup_path.suffix == '.gz' or backup_path.suffixes[-1] == '.gz':
                # Extract compressed backup
                temp_extracted = backup_path.parent / f"temp_extract_{backup_path.stem}"
                temp_extracted.mkdir(exist_ok=True)
                
                extract_cmd = ["tar", "-xzf", str(backup_path), "-C", str(temp_extracted)]
                extract_result = subprocess.run(extract_cmd, capture_output=True, text=True)
                
                if extract_result.returncode != 0:
                    logger.error(f"Failed to extract backup: {extract_result.stderr}")
                    return False
                
                # Find the extracted database directory
                for item in temp_extracted.iterdir():
                    if item.is_dir() and item.name == target_db:
                        restore_path = item
                        break
                else:
                    logger.error(f"Could not find database directory '{target_db}' in backup")
                    return False
            
            # Create mongorestore command
            mongo_uri = os.getenv("MONGO_DB_URI")
            cmd = [
                "mongorestore",
                "--uri", mongo_uri,
                "--db", target_db,
                "--drop",  # Drop existing database
                str(restore_path)
            ]
            
            # Execute mongorestore
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            # Cleanup temporary extraction
            if temp_extracted and temp_extracted.exists():
                shutil.rmtree(temp_extracted)
            
            if result.returncode != 0:
                logger.error(f"mongorestore failed: {result.stderr}")
                return False
            
            logger.info(f"Database restored successfully from: {backup_path}")
            return True
            
        except Exception as e:
            logger.error(f"Restore failed with error: {str(e)}")
            return False

def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="VAGS MongoDB Backup Tool")
    parser.add_argument("action", choices=["backup", "list", "restore"], help="Action to perform")
    parser.add_argument("--file", help="Backup file path (for restore)")
    parser.add_argument("--db", help="Target database name (for restore)")
    parser.add_argument("--no-compress", action="store_true", help="Don't compress backup")
    
    args = parser.parse_args()
    
    backup_tool = MongoDBBackup()
    
    if args.action == "backup":
        logger.info("Creating MongoDB backup...")
        backup_path = backup_tool.create_backup(compress=not args.no_compress)
        if backup_path:
            print(f"Backup created successfully: {backup_path}")
        else:
            print("Backup failed!")
            sys.exit(1)
    
    elif args.action == "list":
        backups = backup_tool.list_backups()
        if backups:
            print(f"\nAvailable backups ({len(backups)}):")
            print("-" * 80)
            for backup in backups:
                size_mb = backup['size'] / (1024 * 1024)
                print(f"File: {backup['filename']}")
                print(f"Size: {size_mb:.2f} MB")
                print(f"Created: {backup['created']}")
                print(f"Database: {backup.get('database_name', 'Unknown')}")
                print("-" * 80)
        else:
            print("No backups found.")
    
    elif args.action == "restore":
        if not args.file:
            print("Error: --file parameter required for restore")
            sys.exit(1)
        
        logger.warning("WARNING: This will overwrite the target database!")
        confirm = input("Are you sure you want to proceed? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Restore cancelled.")
            sys.exit(0)
        
        success = backup_tool.restore_backup(args.file, args.db)
        if success:
            print("Database restored successfully!")
        else:
            print("Restore failed!")
            sys.exit(1)

if __name__ == "__main__":
    main()
