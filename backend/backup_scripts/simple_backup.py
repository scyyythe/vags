#!/usr/bin/env python3
"""
Simple Database Backup for VAGS
Creates a basic backup without complex dependencies
"""

import os
import json
import datetime
import subprocess
from pathlib import Path

def create_simple_backup():
    """Create a simple backup of the VAGS system"""
    print("🚀 VAGS Simple Backup System")
    print("=" * 40)
    
    # Create backup directory
    backup_dir = Path("simple_backups")
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_info = {
        "timestamp": timestamp,
        "created_at": datetime.datetime.now().isoformat(),
        "backup_type": "simple_backup",
        "database_info": {},
        "success": False
    }
    
    print(f"📅 Backup timestamp: {timestamp}")
    print(f"📁 Backup directory: {backup_dir.absolute()}")
    
    try:
        # Get database connection info
        mongo_uri = os.getenv("MONGO_DB_URI", "mongodb+srv://canete:Canete062723%21@cluster0.lngnj.mongodb.net/virtual_art?retryWrites=true&w=majority&authSource=admin")
        db_name = os.getenv("MONGO_DB_NAME", "virtual_art")
        
        backup_info["database_info"] = {
            "uri": mongo_uri.split("@")[0] + "@***",  # Hide password
            "database": db_name
        }
        
        print(f"🗄️  Database: {db_name}")
        print(f"🌐 Connection: {mongo_uri.split('@')[0]}@***")
        
        # Try to connect and get database info
        try:
            # Try to use mongoexport if available
            print("\n📊 Attempting to export database collections...")
            
            collections = ["users", "art", "exhibits", "auctions", "bids", "tips", "wishlists", "comments", "follows", "notifications"]
            exported_collections = []
            
            for collection in collections:
                try:
                    output_file = backup_dir / f"{collection}_{timestamp}.json"
                    cmd = [
                        "mongoexport",
                        "--uri", mongo_uri,
                        "--collection", collection,
                        "--out", str(output_file)
                    ]
                    
                    print(f"  📤 Exporting {collection}...")
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
                    
                    if result.returncode == 0:
                        if output_file.exists() and output_file.stat().st_size > 0:
                            exported_collections.append({
                                "collection": collection,
                                "file": str(output_file),
                                "size": output_file.stat().st_size
                            })
                            print(f"  ✅ {collection} exported successfully")
                        else:
                            print(f"  ⚠️  {collection} - no data found")
                    else:
                        print(f"  ⚠️  {collection} - export failed: {result.stderr}")
                        
                except subprocess.TimeoutExpired:
                    print(f"  ⚠️  {collection} - export timeout")
                except FileNotFoundError:
                    print(f"  ⚠️  mongoexport not found - skipping database export")
                    break
                except Exception as e:
                    print(f"  ⚠️  {collection} - error: {e}")
            
            backup_info["exported_collections"] = exported_collections
            
        except Exception as e:
            print(f"  ⚠️  Database export failed: {e}")
            backup_info["database_error"] = str(e)
        
        # Create backup summary
        backup_info["success"] = True
        backup_info["total_collections"] = len(backup_info.get("exported_collections", []))
        
        # Save backup info
        info_file = backup_dir / f"backup_info_{timestamp}.json"
        with open(info_file, 'w') as f:
            json.dump(backup_info, f, indent=2)
        
        print(f"\n✅ Simple backup completed successfully!")
        print(f"📄 Backup info saved: {info_file}")
        print(f"🗄️  Collections exported: {backup_info['total_collections']}")
        
        if backup_info.get("exported_collections"):
            total_size = sum(col["size"] for col in backup_info["exported_collections"])
            print(f"📊 Total backup size: {total_size / 1024:.2f} KB")
        
        print(f"\n💡 To restore this backup:")
        print(f"   1. Use mongoimport to restore each collection")
        print(f"   2. Example: mongoimport --uri [your_uri] --collection users --file {collections[0]}_{timestamp}.json")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Backup failed: {e}")
        backup_info["error"] = str(e)
        
        # Save error info
        error_file = backup_dir / f"backup_error_{timestamp}.json"
        with open(error_file, 'w') as f:
            json.dump(backup_info, f, indent=2)
        
        return False

def list_backups():
    """List available backups"""
    backup_dir = Path("simple_backups")
    
    if not backup_dir.exists():
        print("No simple backups found.")
        return
    
    print("📋 Available Simple Backups:")
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
        print(f"   Collections: {backup.get('total_collections', 0)}")
        if backup.get('exported_collections'):
            total_size = sum(col["size"] for col in backup["exported_collections"])
            print(f"   Size: {total_size / 1024:.2f} KB")
        if backup['success']:
            print(f"   Status: ✅ Success")
        else:
            print(f"   Status: ❌ Failed")

def main():
    """Main function"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_backups()
    else:
        create_simple_backup()

if __name__ == "__main__":
    main()
