#!/usr/bin/env python3
"""
Show All Backups - VAGS Backup Manager
Displays all available backups in an organized way
"""

import os
import json
from pathlib import Path
import datetime

def show_all_backups():
    """Show all available backups"""
    print("📊 VAGS BACKUP MANAGER")
    print("=" * 50)
    
    backup_root = Path("backend/backups")
    
    if not backup_root.exists():
        print("❌ No backups directory found.")
        return
    
    total_backups = 0
    total_size = 0
    
    # Check each backup type
    backup_types = [
        ("python_backups", "🐍 Python Database Backups"),
        ("quick_backups", "🚀 Quick Configuration Backups"),
        ("simple_backups", "📋 Simple Backups"),
        ("mongodb_backups", "🗄️ MongoDB Backups"),
        ("file_backups", "📁 File Backups")
    ]
    
    for backup_type, display_name in backup_types:
        backup_dir = backup_root / backup_type
        
        if backup_dir.exists():
            print(f"\n{display_name}")
            print("-" * 40)
            
            backups = []
            
            # Find backup info files
            for item in backup_dir.iterdir():
                if item.name.startswith("backup_info_") and item.suffix == ".json":
                    try:
                        with open(item, 'r') as f:
                            backup_info = json.load(f)
                        backups.append(backup_info)
                    except Exception as e:
                        print(f"  ⚠️  Error reading {item.name}: {e}")
            
            if backups:
                # Sort by timestamp
                backups.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
                
                for i, backup in enumerate(backups, 1):
                    timestamp = backup.get('timestamp', 'Unknown')
                    created = backup.get('created_at', 'Unknown')
                    success = backup.get('success', False)
                    
                    print(f"  {i}. {timestamp}")
                    print(f"     Created: {created}")
                    
                    if success:
                        print(f"     Status: ✅ Success")
                        
                        # Show specific info based on backup type
                        if backup_type == "python_backups":
                            collections = backup.get('total_collections_exported', 0)
                            documents = backup.get('total_documents', 0)
                            print(f"     Collections: {collections}")
                            print(f"     Documents: {documents}")
                        elif backup_type == "quick_backups":
                            files = backup.get('total_files', 0)
                            print(f"     Files: {files}")
                        
                        # Calculate size
                        if backup_type == "python_backups" and backup.get('exported_collections'):
                            size = sum(col.get("size", 0) for col in backup["exported_collections"] if "size" in col)
                            print(f"     Size: {size / 1024:.2f} KB")
                            total_size += size
                        
                        total_backups += 1
                    else:
                        print(f"     Status: ❌ Failed")
                        error = backup.get('error', 'Unknown error')
                        print(f"     Error: {error}")
                    
                    print()
            else:
                print("  No backup info files found.")
        else:
            print(f"\n{display_name}")
            print("-" * 40)
            print("  No backups found.")
    
    # Summary
    print("\n📈 BACKUP SUMMARY")
    print("=" * 50)
    print(f"Total Backups: {total_backups}")
    print(f"Total Size: {total_size / 1024:.2f} KB")
    print(f"Backup Location: {backup_root.absolute()}")
    
    # Show directory structure
    print(f"\n📁 BACKUP DIRECTORY STRUCTURE:")
    print(f"{backup_root.absolute()}")
    for item in backup_root.iterdir():
        if item.is_dir():
            file_count = len(list(item.iterdir()))
            print(f"  ├── {item.name}/ ({file_count} items)")

def main():
    """Main function"""
    show_all_backups()

if __name__ == "__main__":
    main()
