#!/usr/bin/env python3
"""
File and Media Backup Script for VAGS System
This script creates backups of your static files, uploads, and configuration files
without affecting the running system.
"""

import os
import shutil
import datetime
import logging
import json
import tarfile
import gzip
from pathlib import Path
from typing import List, Dict, Optional
import sys
import requests
import cloudinary
import cloudinary.api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('file_backup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FileBackup:
    def __init__(self):
        self.backup_dir = Path("backups/files")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.retention_days = 30  # Keep backups for 30 days
        
        # Define files and directories to backup
        self.backup_paths = {
            "static_files": "backend/static",
            "media_files": "backend/media",
            "config_files": [
                "backend/backend/settings.py",
                "backend/requirements.txt",
                "docker-compose.yml",
                "backend/Dockerfile",
                "front/Dockerfile",
                "front/package.json",
                "front/vercel.json"
            ],
            "secrets": "backend/secrets",
            "logs": "backend/logs"
        }
        
        # Initialize Cloudinary if configured
        try:
            cloudinary.config(
                cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
                api_key=os.getenv("CLOUDINARY_API_KEY"),
                api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            )
            self.cloudinary_configured = True
        except Exception as e:
            logger.warning(f"Cloudinary not configured: {e}")
            self.cloudinary_configured = False
    
    def create_file_backup(self, compress: bool = True) -> Optional[str]:
        """
        Create a comprehensive file backup
        Returns the backup file path if successful, None otherwise
        """
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"vags_files_backup_{timestamp}"
            backup_path = self.backup_dir / backup_filename
            
            logger.info("Starting file backup...")
            
            # Create temporary directory for backup
            temp_backup_dir = self.backup_dir / f"temp_{backup_filename}"
            temp_backup_dir.mkdir(exist_ok=True)
            
            # Backup local files
            self._backup_local_files(temp_backup_dir)
            
            # Backup Cloudinary assets if configured
            if self.cloudinary_configured:
                self._backup_cloudinary_assets(temp_backup_dir)
            
            # Create backup metadata
            self._create_backup_metadata(temp_backup_dir, backup_filename)
            
            # Compress backup if requested
            if compress:
                compressed_path = f"{backup_path}.tar.gz"
                logger.info(f"Compressing backup to: {compressed_path}")
                
                with tarfile.open(compressed_path, "w:gz") as tar:
                    tar.add(temp_backup_dir, arcname=backup_filename)
                
                # Remove temporary directory
                shutil.rmtree(temp_backup_dir)
                backup_path = Path(compressed_path)
            else:
                # Move temp directory to final location
                temp_backup_dir.rename(backup_path)
            
            logger.info(f"File backup created successfully: {backup_path}")
            
            # Clean old backups
            self._cleanup_old_backups()
            
            return str(backup_path)
            
        except Exception as e:
            logger.error(f"File backup failed with error: {str(e)}")
            return None
    
    def _backup_local_files(self, backup_dir: Path):
        """Backup local files and directories"""
        logger.info("Backing up local files...")
        
        for backup_type, path_config in self.backup_paths.items():
            backup_subdir = backup_dir / backup_type
            backup_subdir.mkdir(exist_ok=True)
            
            if isinstance(path_config, list):
                # Handle list of files
                for file_path in path_config:
                    self._backup_single_file(Path(file_path), backup_subdir)
            else:
                # Handle single directory/file
                self._backup_single_path(Path(path_config), backup_subdir)
    
    def _backup_single_path(self, source_path: Path, backup_dir: Path):
        """Backup a single file or directory"""
        if not source_path.exists():
            logger.warning(f"Path does not exist, skipping: {source_path}")
            return
        
        try:
            if source_path.is_file():
                # Backup single file
                shutil.copy2(source_path, backup_dir)
                logger.info(f"Backed up file: {source_path}")
            elif source_path.is_dir():
                # Backup directory
                dest_path = backup_dir / source_path.name
                shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
                logger.info(f"Backed up directory: {source_path}")
        except Exception as e:
            logger.error(f"Failed to backup {source_path}: {e}")
    
    def _backup_single_file(self, source_file: Path, backup_dir: Path):
        """Backup a single file"""
        if not source_file.exists():
            logger.warning(f"File does not exist, skipping: {source_file}")
            return
        
        try:
            # Preserve directory structure
            relative_path = source_file.relative_to(Path.cwd())
            dest_path = backup_dir / relative_path
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.copy2(source_file, dest_path)
            logger.info(f"Backed up file: {source_file}")
        except Exception as e:
            logger.error(f"Failed to backup file {source_file}: {e}")
    
    def _backup_cloudinary_assets(self, backup_dir: Path):
        """Backup Cloudinary assets metadata"""
        if not self.cloudinary_configured:
            return
        
        logger.info("Backing up Cloudinary assets metadata...")
        
        try:
            cloudinary_dir = backup_dir / "cloudinary_assets"
            cloudinary_dir.mkdir(exist_ok=True)
            
            # Get list of all resources
            resources = []
            next_cursor = None
            
            while True:
                if next_cursor:
                    result = cloudinary.api.resources(
                        type="upload",
                        max_results=500,
                        next_cursor=next_cursor
                    )
                else:
                    result = cloudinary.api.resources(
                        type="upload",
                        max_results=500
                    )
                
                resources.extend(result.get('resources', []))
                
                next_cursor = result.get('next_cursor')
                if not next_cursor:
                    break
            
            # Save resources metadata
            metadata_file = cloudinary_dir / "resources_metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(resources, f, indent=2)
            
            logger.info(f"Backed up {len(resources)} Cloudinary assets metadata")
            
            # Create download list for important assets
            download_list = []
            for resource in resources[:100]:  # Limit to first 100 for demo
                if resource.get('resource_type') == 'image':
                    download_list.append({
                        'public_id': resource['public_id'],
                        'url': resource['secure_url'],
                        'format': resource['format'],
                        'bytes': resource['bytes']
                    })
            
            download_file = cloudinary_dir / "download_list.json"
            with open(download_file, 'w') as f:
                json.dump(download_list, f, indent=2)
            
            logger.info(f"Created download list for {len(download_list)} assets")
            
        except Exception as e:
            logger.error(f"Failed to backup Cloudinary assets: {e}")
    
    def _create_backup_metadata(self, backup_dir: Path, backup_name: str):
        """Create metadata file for the backup"""
        metadata = {
            "backup_date": datetime.datetime.now().isoformat(),
            "backup_name": backup_name,
            "backup_type": "files_and_media",
            "system_info": {
                "hostname": os.uname().nodename if hasattr(os, 'uname identified') else "unknown",
                "python_version": sys.version,
                "working_directory": str(Path.cwd())
            },
            "backup_contents": {},
            "cloudinary_configured": self.cloudinary_configured
        }
        
        # Calculate backup contents
        for item in backup_dir.iterdir():
            if item.is_dir():
                size = sum(f.stat().st_size for f in item.rglob('*') if f.is_file())
                metadata["backup_contents"][item.name] = {
                    "type": "directory",
                    "size_bytes": size,
                    "file_count": len(list(item.rglob('*')))
                }
        
        metadata_path = backup_dir / "backup_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Backup metadata created: {metadata_path}")
    
    def _cleanup_old_backups(self):
        """Remove backups older than retention period"""
        try:
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=self.retention_days)
            
            for backup_file in self.backup_dir.glob("vags_files_backup_*"):
                if backup_file.is_file() or backup_file.is_dir():
                    file_time = datetime.datetime.fromtimestamp(backup_file.stat().st_mtime)
                    
                    if file_time < cutoff_date:
                        logger.info(f"Removing old backup: {backup_file}")
                        if backup_file.is_file():
                            backup_file.unlink()
                        else:
                            shutil.rmtree(backup_file)
                            
        except Exception as e:
            logger.error(f"Error cleaning up old backups: {str(e)}")
    
    def list_backups(self) -> List[Dict]:
        """List all available file backups"""
        backups = []
        
        for backup_file in self.backup_dir.glob("vags_files_backup_*"):
            if backup_file.is_file() or backup_file.is_dir():
                backup_info = {
                    "filename": backup_file.name,
                    "path": str(backup_file),
                    "size": backup_file.stat().st_size if backup_file.exists() else 0,
                    "created": datetime.datetime.fromtimestamp(backup_file.stat().st_mtime).isoformat(),
                    "type": "file" if backup_file.is_file() else "directory"
                }
                backups.append(backup_info)
        
        return sorted(backups, key=lambda x: x['created'], reverse=True)
    
    def restore_backup(self, backup_path: str, target_dir: Optional[str] = None) -> bool:
        """
        Restore a file backup
        """
        try:
            backup_path = Path(backup_path)
            
            if not backup_path.exists():
                logger.error(f"Backup file not found: {backup_path}")
                return False
            
            if not target_dir:
                target_dir = Path.cwd()
            else:
                target_dir = Path(target_dir)
            
            logger.info(f"Restoring file backup from: {backup_path}")
            
            # Handle compressed backups
            if backup_path.suffix == '.gz' or backup_path.suffixes[-1] == '.gz':
                # Extract compressed backup
                temp_extract_dir = self.backup_dir / f"temp_extract_{backup_path.stem}"
                temp_extract_dir.mkdir(exist_ok=True)
                
                with tarfile.open(backup_path, "r:gz") as tar:
                    tar.extractall(temp_extract_dir)
                
                # Find the extracted backup directory
                extracted_backup = None
                for item in temp_extract_dir.iterdir():
                    if item.is_dir() and item.name.startswith("vags_files_backup_"):
                        extracted_backup = item
                        break
                
                if not extracted_backup:
                    logger.error("Could not find extracted backup directory")
                    shutil.rmtree(temp_extract_dir)
                    return False
                
                # Restore files
                self._restore_files_from_directory(extracted_backup, target_dir)
                
                # Cleanup
                shutil.rmtree(temp_extract_dir)
            else:
                # Restore from directory
                self._restore_files_from_directory(backup_path, target_dir)
            
            logger.info(f"File backup restored successfully to: {target_dir}")
            return True
            
        except Exception as e:
            logger.error(f"Restore failed with error: {str(e)}")
            return False
    
    def _restore_files_from_directory(self, backup_dir: Path, target_dir: Path):
        """Restore files from backup directory"""
        for item in backup_dir.iterdir():
            if item.name == "backup_metadata.json":
                continue
            
            target_path = target_dir / item.name
            
            try:
                if item.is_file():
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(item, target_path)
                elif item.is_dir():
                    if target_path.exists():
                        shutil.rmtree(target_path)
                    shutil.copytree(item, target_path)
                
                logger.info(f"Restored: {item.name}")
            except Exception as e:
                logger.error(f"Failed to restore {item.name}: {e}")

def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="VAGS File Backup Tool")
    parser.add_argument("action", choices=["backup", "list", "restore"], help="Action to perform")
    parser.add_argument("--file", help="Backup file path (for restore)")
    parser.add_argument("--target", help="Target directory (for restore)")
    parser.add_argument("--no-compress", action="store_true", help="Don't compress backup")
    
    args = parser.parse_args()
    
    backup_tool = FileBackup()
    
    if args.action == "backup":
        logger.info("Creating file backup...")
        backup_path = backup_tool.create_file_backup(compress=not args.no_compress)
        if backup_path:
            print(f"File backup created successfully: {backup_path}")
        else:
            print("File backup failed!")
            sys.exit(1)
    
    elif args.action == "list":
        backups = backup_tool.list_backups()
        if backups:
            print(f"\nAvailable file backups ({len(backups)}):")
            print("-" * 80)
            for backup in backups:
                size_mb = backup['size'] / (1024 * 1024)
                print(f"File: {backup['filename']}")
                print(f"Size: {size_mb:.2f} MB")
                print(f"Created: {backup['created']}")
                print(f"Type: {backup['type']}")
                print("-" * 80)
        else:
            print("No file backups found.")
    
    elif args.action == "restore":
        if not args.file:
            print("Error: --file parameter required for restore")
            sys.exit(1)
        
        logger.warning("WARNING: This will overwrite existing files!")
        confirm = input("Are you sure you want to proceed? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Restore cancelled.")
            sys.exit(0)
        
        success = backup_tool.restore_backup(args.file, args.target)
        if success:
            print("File backup restored successfully!")
        else:
            print("Restore failed!")
            sys.exit(1)

if __name__ == "__main__":
    main()
