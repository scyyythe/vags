#!/usr/bin/env python3
"""
Python-based Database Backup for VAGS
Uses pymongo to directly export database collections to JSON
"""

import os
import json
import datetime
from pathlib import Path
import sys

# Add the parent directory to the path to import Django settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import pymongo
    from bson import ObjectId
    from bson.json_util import dumps
except ImportError as e:
    print(f"❌ Required packages not found: {e}")
    print("Please install: pip install pymongo")
    sys.exit(1)

def create_python_backup():
    """Create a Python-based backup of the VAGS database"""
    print("🐍 VAGS Python Database Backup")
    print("=" * 40)
    
    # Create backup directory
    backup_dir = Path("backend/backups/python_backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_info = {
        "timestamp": timestamp,
        "created_at": datetime.datetime.now().isoformat(),
        "backup_type": "python_backup",
        "database_info": {},
        "exported_collections": [],
        "success": False
    }
    
    print(f"📅 Backup timestamp: {timestamp}")
    print(f"📁 Backup directory: {backup_dir.absolute()}")
    
    try:
        # Get database connection info
        mongo_uri = os.getenv("MONGO_DB_URI", "mongodb+srv://canete:Canete062723%21@cluster0.lngnj.mongodb.net/virtual_art?retryWrites=true&w=majority&authSource=admin")
        db_name = os.getenv("MONGO_DB_NAME", "virtual_art")
        
        print(f"🗄️  Database: {db_name}")
        print(f"🌐 Connecting to MongoDB...")
        
        # Connect to MongoDB
        client = pymongo.MongoClient(mongo_uri)
        db = client[db_name]
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully!")
        
        backup_info["database_info"] = {
            "database": db_name,
            "connection_status": "success"
        }
        
        # Get list of collections
        collections = db.list_collection_names()
        print(f"📊 Found {len(collections)} collections: {', '.join(collections)}")
        
        exported_count = 0
        total_documents = 0
        
        for collection_name in collections:
            try:
                print(f"\n📤 Exporting {collection_name}...")
                
                collection = db[collection_name]
                documents = list(collection.find())
                
                if documents:
                    # Create backup file
                    backup_file = backup_dir / f"{collection_name}_{timestamp}.json"
                    
                    # Export to JSON
                    with open(backup_file, 'w', encoding='utf-8') as f:
                        # Use bson.json_util.dumps to handle ObjectId and other BSON types
                        json_data = dumps(documents, indent=2, ensure_ascii=False)
                        f.write(json_data)
                    
                    file_size = backup_file.stat().st_size
                    doc_count = len(documents)
                    
                    backup_info["exported_collections"].append({
                        "collection": collection_name,
                        "file": str(backup_file),
                        "size": file_size,
                        "document_count": doc_count
                    })
                    
                    print(f"  ✅ {collection_name}: {doc_count} documents, {file_size / 1024:.2f} KB")
                    exported_count += 1
                    total_documents += doc_count
                else:
                    print(f"  ⚠️  {collection_name}: No documents found")
                    
            except Exception as e:
                print(f"  ❌ {collection_name}: Export failed - {e}")
                backup_info["exported_collections"].append({
                    "collection": collection_name,
                    "error": str(e)
                })
        
        # Close connection
        client.close()
        
        # Create backup summary
        backup_info["success"] = True
        backup_info["total_collections_exported"] = exported_count
        backup_info["total_documents"] = total_documents
        
        # Save backup info
        info_file = backup_dir / f"backup_info_{timestamp}.json"
        with open(info_file, 'w') as f:
            json.dump(backup_info, f, indent=2, default=str)
        
        print(f"\n✅ Python backup completed successfully!")
        print(f"📄 Backup info saved: {info_file}")
        print(f"🗄️  Collections exported: {exported_count}/{len(collections)}")
        print(f"📊 Total documents: {total_documents}")
        
        if backup_info["exported_collections"]:
            total_size = sum(col.get("size", 0) for col in backup_info["exported_collections"] if "size" in col)
            print(f"💾 Total backup size: {total_size / 1024:.2f} KB")
        
        print(f"\n💡 To restore this backup:")
        print(f"   1. Use mongoimport to restore each collection")
        print(f"   2. Example: mongoimport --uri [your_uri] --collection users --file users_{timestamp}.json")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Backup failed: {e}")
        backup_info["error"] = str(e)
        
        # Save error info
        error_file = backup_dir / f"backup_error_{timestamp}.json"
        with open(error_file, 'w') as f:
            json.dump(backup_info, f, indent=2, default=str)
        
        return False

def list_backups():
    """List available Python backups"""
    backup_dir = Path("backend/backups/python_backups")
    
    if not backup_dir.exists():
        print("No Python backups found.")
        return
    
    print("📋 Available Python Backups:")
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
        print(f"   Collections: {backup.get('total_collections_exported', 0)}")
        print(f"   Documents: {backup.get('total_documents', 0)}")
        
        if backup.get('exported_collections'):
            total_size = sum(col.get("size", 0) for col in backup["exported_collections"] if "size" in col)
            print(f"   Size: {total_size / 1024:.2f} KB")
        
        if backup['success']:
            print(f"   Status: ✅ Success")
        else:
            print(f"   Status: ❌ Failed")

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_backups()
    else:
        create_python_backup()

if __name__ == "__main__":
    main()
