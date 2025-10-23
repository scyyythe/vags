#!/usr/bin/env python3
"""
Quick Backup Script for VAGS System
Simple one-command backup solution that doesn't require complex setup
"""

import os
import sys
import datetime
import subprocess
import json
from pathlib import Path

def create_quick_backup():
    """Create a quick backup of the VAGS system"""
    print("🚀 VAGS Quick Backup System")
    print("=" * 40)
    
    # Create backup directory
    backup_dir = Path("backend/backups/quick_backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print(f"📅 Backup timestamp: {timestamp}")
    print(f"📁 Backup directory: {backup_dir.absolute()}")
    
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("front").exists():
        print("❌ Error: Please run this script from the VAGS project root directory")
        return False
    
    backup_info = {
        "timestamp": timestamp,
        "created_at": datetime.datetime.now().isoformat(),
        "backup_type": "quick_backup",
        "files_backed_up": [],
        "success": False
    }
    
    try:
        # Backup important configuration files
        config_files = [
            "backend/backend/settings.py",
            "backend/requirements.txt",
            "docker-compose.yml",
            "backend/Dockerfile",
            "front/Dockerfile",
            "front/package.json",
            "front/vercel.json"
        ]
        
        print("\n📋 Backing up configuration files...")
        config_backup_dir = backup_dir / f"config_{timestamp}"
        config_backup_dir.mkdir(exist_ok=True)
        
        for config_file in config_files:
            if Path(config_file).exists():
                import shutil
                dest_path = config_backup_dir / Path(config_file).name
                shutil.copy2(config_file, dest_path)
                backup_info["files_backed_up"].append(config_file)
                print(f"  ✅ {config_file}")
            else:
                print(f"  ⚠️  {config_file} (not found)")
        
        # Create a simple database export (if MongoDB tools are available)
        print("\n🗄️  Attempting database backup...")
        try:
            # Try to export database using mongoexport
            db_backup_file = backup_dir / f"database_{timestamp}.json"
            
            # Get database name from environment or use default
            db_name = os.getenv("MONGO_DB_NAME", "vags_db")
            mongo_uri = os.getenv("MONGO_DB_URI", "mongodb://localhost:27017")
            
            # Try to export main collections
            collections = ["users", "art", "exhibits", "auctions", "bids"]
            exported_collections = []
            
            for collection in collections:
                try:
                    cmd = [
                        "mongoexport",
                        "--uri", f"{mongo_uri}/{db_name}",
                        "--collection", collection,
                        "--out", str(backup_dir / f"{collection}_{timestamp}.json")
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                    if result.returncode == 0:
                        exported_collections.append(collection)
                        print(f"  ✅ Exported {collection}")
                    else:
                        print(f"  ⚠️  Failed to export {collection}: {result.stderr}")
                        
                except subprocess.TimeoutExpired:
                    print(f"  ⚠️  Timeout exporting {collection}")
                except FileNotFoundError:
                    print(f"  ⚠️  mongoexport not found - skipping database backup")
                    break
                except Exception as e:
                    print(f"  ⚠️  Error exporting {collection}: {e}")
            
            if exported_collections:
                backup_info["database_collections"] = exported_collections
                print(f"  📊 Successfully exported {len(exported_collections)} collections")
            else:
                print("  ⚠️  No database collections exported")
                
        except Exception as e:
            print(f"  ⚠️  Database backup failed: {e}")
        
        # Create backup summary
        backup_info["success"] = True
        backup_info["total_files"] = len(backup_info["files_backed_up"])
        
        # Save backup info
        info_file = backup_dir / f"backup_info_{timestamp}.json"
        with open(info_file, 'w') as f:
            json.dump(backup_info, f, indent=2)
        
        print(f"\n✅ Quick backup completed successfully!")
        print(f"📄 Backup info saved: {info_file}")
        print(f"📁 Files backed up: {backup_info['total_files']}")
        
        if 'database_collections' in backup_info:
            print(f"🗄️  Database collections: {len(backup_info['database_collections'])}")
        
        print(f"\n💡 To restore this backup:")
        print(f"   1. Copy the files from {backup_dir.absolute()}")
        print(f"   2. Restore configuration files to their original locations")
        print(f"   3. Use mongoimport to restore database collections")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Backup failed: {e}")
        backup_info["error"] = str(e)
        
        # Save error info
        error_file = backup_dir / f"backup_error_{timestamp}.json"
        with open(error_file, 'w') as f:
            json.dump(backup_info, f, indent=2)
        
        return False

def list_quick_backups():
    """List available quick backups"""
    backup_dir = Path("backend/backups/quick_backups")
    
    if not backup_dir.exists():
        print("No quick backups found.")
        return
    
    print("📋 Available Quick Backups:")
    print("=" * 40)
    
    backups = []
    for item in backup_dir.iterdir():
        if item.name.startswith("backup_info_"):
            try:
                with open(item, 'r') as f:
                    backup_info = json.load(f)
                backups.append(backup_info)
            except Exception as e:
                print(f"⚠️  Error reading {item}: {e}")
    
    if not backups:
        print("No valid backup info files found.")
        return
    
    # Sort by timestamp
    backups.sort(key=lambda x: x['timestamp'], reverse=True)
    
    for i, backup in enumerate(backups, 1):
        print(f"\n{i}. Backup: {backup['timestamp']}")
        print(f"   Created: {backup['created_at']}")
        print(f"   Files: {backup['total_files']}")
        if 'database_collections' in backup:
            print(f"   Collections: {len(backup['database_collections'])}")
        if backup['success']:
            print(f"   Status: ✅ Success")
        else:
            print(f"   Status: ❌ Failed")

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_quick_backups()
    else:
        create_quick_backup()

if __name__ == "__main__":
    main()
