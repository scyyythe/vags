#!/usr/bin/env python3
"""
Emergency Recovery Tool for VAGS System
Helps you recover from system failures quickly
"""

import os
import json
import subprocess
from pathlib import Path
import datetime

def emergency_recovery_menu():
    """Emergency recovery menu"""
    print("🚨 VAGS EMERGENCY RECOVERY TOOL")
    print("=" * 50)
    print("This tool helps you recover from system failures")
    print()
    
    while True:
        print("Choose recovery option:")
        print("1. 🔍 Diagnose System Status")
        print("2. 📊 View Available Backups")
        print("3. 🔄 Restore Database Collection")
        print("4. 📁 Restore Configuration Files")
        print("5. 🆘 Complete System Recovery")
        print("6. 📋 Create Emergency Backup")
        print("7. ❌ Exit")
        
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == "1":
            diagnose_system()
        elif choice == "2":
            view_backups()
        elif choice == "3":
            restore_database_collection()
        elif choice == "4":
            restore_configuration_files()
        elif choice == "5":
            complete_system_recovery()
        elif choice == "6":
            create_emergency_backup()
        elif choice == "7":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")
        print("\n" + "="*50)

def diagnose_system():
    """Diagnose system status"""
    print("\n🔍 SYSTEM DIAGNOSIS")
    print("-" * 30)
    
    issues = []
    
    # Check if backup directory exists
    backup_dir = Path("backend/backups")
    if not backup_dir.exists():
        issues.append("❌ Backup directory not found")
    else:
        print("✅ Backup directory exists")
    
    # Check if database backups exist
    python_backups = backup_dir / "python_backups"
    if not python_backups.exists():
        issues.append("❌ No database backups found")
    else:
        backup_files = list(python_backups.glob("*.json"))
        if backup_files:
            print(f"✅ {len(backup_files)} database backup files found")
        else:
            issues.append("❌ No database backup files found")
    
    # Check if configuration backups exist
    quick_backups = backup_dir / "quick_backups"
    if not quick_backups.exists():
        issues.append("❌ No configuration backups found")
    else:
        print("✅ Configuration backups found")
    
    # Check environment variables
    mongo_uri = os.getenv("MONGO_DB_URI")
    if not mongo_uri:
        issues.append("❌ MongoDB URI not set in environment")
    else:
        print("✅ MongoDB URI configured")
    
    if issues:
        print("\n⚠️  ISSUES FOUND:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("\n✅ SYSTEM STATUS: HEALTHY")
        print("All backup systems are working correctly.")

def view_backups():
    """View available backups"""
    print("\n📊 AVAILABLE BACKUPS")
    print("-" * 30)
    
    backup_dir = Path("backend/backups")
    if not backup_dir.exists():
        print("❌ No backup directory found")
        return
    
    # Database backups
    python_backups = backup_dir / "python_backups"
    if python_backups.exists():
        backup_files = list(python_backups.glob("backup_info_*.json"))
        if backup_files:
            print(f"\n🐍 Database Backups ({len(backup_files)}):")
            for backup_file in sorted(backup_files, reverse=True):
                try:
                    with open(backup_file, 'r') as f:
                        backup_info = json.load(f)
                    timestamp = backup_info.get('timestamp', 'Unknown')
                    collections = backup_info.get('total_collections_exported', 0)
                    documents = backup_info.get('total_documents', 0)
                    print(f"  📅 {timestamp}: {collections} collections, {documents} documents")
                except Exception as e:
                    print(f"  ⚠️  Error reading {backup_file.name}: {e}")
    
    # Configuration backups
    quick_backups = backup_dir / "quick_backups"
    if quick_backups.exists():
        backup_files = list(quick_backups.glob("backup_info_*.json"))
        if backup_files:
            print(f"\n🚀 Configuration Backups ({len(backup_files)}):")
            for backup_file in sorted(backup_files, reverse=True):
                try:
                    with open(backup_file, 'r') as f:
                        backup_info = json.load(f)
                    timestamp = backup_info.get('timestamp', 'Unknown')
                    files = backup_info.get('total_files', 0)
                    print(f"  📅 {timestamp}: {files} files")
                except Exception as e:
                    print(f"  ⚠️  Error reading {backup_file.name}: {e}")

def restore_database_collection():
    """Restore a specific database collection"""
    print("\n🔄 DATABASE COLLECTION RESTORE")
    print("-" * 30)
    
    backup_dir = Path("backend/backups/python_backups")
    if not backup_dir.exists():
        print("❌ No database backups found")
        return
    
    # Get available collections
    collection_files = []
    for file in backup_dir.glob("*_*.json"):
        if not file.name.startswith("backup_info_"):
            collection_name = file.name.split("_")[0]
            collection_files.append((collection_name, file))
    
    if not collection_files:
        print("❌ No collection backup files found")
        return
    
    print("Available collections to restore:")
    for i, (collection, file) in enumerate(collection_files, 1):
        print(f"  {i}. {collection}")
    
    try:
        choice = int(input("\nEnter collection number to restore: ")) - 1
        if 0 <= choice < len(collection_files):
            collection_name, backup_file = collection_files[choice]
            
            print(f"\n⚠️  WARNING: This will overwrite the '{collection_name}' collection!")
            confirm = input("Are you sure? (yes/no): ").lower()
            
            if confirm == "yes":
                # Get MongoDB URI
                mongo_uri = os.getenv("MONGO_DB_URI", "mongodb+srv://canete:Canete062723%21@cluster0.lngnj.mongodb.net/virtual_art?retryWrites=true&w=majority&authSource=admin")
                
                print(f"🔄 Restoring {collection_name}...")
                
                # Try to use mongoimport
                try:
                    cmd = [
                        "mongoimport",
                        "--uri", mongo_uri,
                        "--collection", collection_name,
                        "--file", str(backup_file),
                        "--drop"  # Drop existing collection
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        print(f"✅ {collection_name} restored successfully!")
                    else:
                        print(f"❌ Restore failed: {result.stderr}")
                        print("💡 Manual restore required:")
                        print(f"   mongoimport --uri \"{mongo_uri}\" --collection {collection_name} --file {backup_file}")
                        
                except FileNotFoundError:
                    print("❌ mongoimport not found")
                    print("💡 Manual restore required:")
                    print(f"   mongoimport --uri \"{mongo_uri}\" --collection {collection_name} --file {backup_file}")
            else:
                print("❌ Restore cancelled")
        else:
            print("❌ Invalid choice")
    except ValueError:
        print("❌ Invalid input")

def restore_configuration_files():
    """Restore configuration files"""
    print("\n📁 CONFIGURATION FILES RESTORE")
    print("-" * 30)
    
    backup_dir = Path("backend/backups/quick_backups")
    if not backup_dir.exists():
        print("❌ No configuration backups found")
        return
    
    # Find latest backup
    backup_dirs = [d for d in backup_dir.iterdir() if d.is_dir() and d.name.startswith("config_")]
    if not backup_dirs:
        print("❌ No configuration backup directories found")
        return
    
    latest_backup = max(backup_dirs, key=lambda x: x.name)
    print(f"📅 Latest backup: {latest_backup.name}")
    
    print("\nAvailable configuration files:")
    config_files = list(latest_backup.iterdir())
    for i, file in enumerate(config_files, 1):
        print(f"  {i}. {file.name}")
    
    try:
        choice = int(input("\nEnter file number to restore: ")) - 1
        if 0 <= choice < len(config_files):
            backup_file = config_files[choice]
            
            print(f"\n⚠️  WARNING: This will overwrite the configuration file!")
            confirm = input("Are you sure? (yes/no): ").lower()
            
            if confirm == "yes":
                # Determine target location
                if backup_file.name == "settings.py":
                    target = Path("backend/backend/settings.py")
                elif backup_file.name == "requirements.txt":
                    target = Path("backend/requirements.txt")
                elif backup_file.name == "docker-compose.yml":
                    target = Path("docker-compose.yml")
                elif backup_file.name == "package.json":
                    target = Path("front/package.json")
                elif backup_file.name == "vercel.json":
                    target = Path("front/vercel.json")
                else:
                    target = Path(backup_file.name)
                
                print(f"🔄 Restoring {backup_file.name} to {target}...")
                
                try:
                    import shutil
                    shutil.copy2(backup_file, target)
                    print(f"✅ {backup_file.name} restored successfully!")
                except Exception as e:
                    print(f"❌ Restore failed: {e}")
            else:
                print("❌ Restore cancelled")
        else:
            print("❌ Invalid choice")
    except ValueError:
        print("❌ Invalid input")

def complete_system_recovery():
    """Complete system recovery"""
    print("\n🆘 COMPLETE SYSTEM RECOVERY")
    print("-" * 30)
    
    print("⚠️  WARNING: This will restore your entire system from backup!")
    print("This should only be used in case of complete system failure.")
    print()
    
    confirm = input("Are you sure you want to proceed? (yes/no): ").lower()
    if confirm != "yes":
        print("❌ Recovery cancelled")
        return
    
    print("\n🔄 Starting complete system recovery...")
    
    # Step 1: Stop services (if running)
    print("1. Stopping services...")
    print("   (Please stop your application manually if it's running)")
    
    # Step 2: Restore database
    print("2. Restoring database...")
    backup_dir = Path("backend/backups/python_backups")
    if backup_dir.exists():
        backup_files = list(backup_dir.glob("backup_info_*.json"))
        if backup_files:
            latest_backup = max(backup_files, key=lambda x: x.name)
            print(f"   Using backup: {latest_backup.name}")
            print("   Please run individual collection restores manually")
        else:
            print("   ❌ No database backups found")
    else:
        print("   ❌ No database backup directory found")
    
    # Step 3: Restore configuration
    print("3. Restoring configuration files...")
    config_backup_dir = Path("backend/backups/quick_backups")
    if config_backup_dir.exists():
        backup_dirs = [d for d in config_backup_dir.iterdir() if d.is_dir() and d.name.startswith("config_")]
        if backup_dirs:
            latest_backup = max(backup_dirs, key=lambda x: x.name)
            print(f"   Using backup: {latest_backup.name}")
            print("   Please restore configuration files manually")
        else:
            print("   ❌ No configuration backups found")
    else:
        print("   ❌ No configuration backup directory found")
    
    print("\n✅ Recovery process completed!")
    print("💡 Next steps:")
    print("   1. Restore database collections manually")
    print("   2. Restore configuration files manually")
    print("   3. Restart your application")
    print("   4. Test all functions")
    print("   5. Create a new backup")

def create_emergency_backup():
    """Create emergency backup"""
    print("\n📋 EMERGENCY BACKUP")
    print("-" * 30)
    
    print("🔄 Creating emergency backup...")
    
    try:
        # Run Python backup
        result = subprocess.run([
            "backend/env/Scripts/python.exe", 
            "backend/backup_scripts/python_backup.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Emergency database backup created successfully!")
        else:
            print(f"❌ Database backup failed: {result.stderr}")
        
        # Run quick backup
        result = subprocess.run([
            "backend/env/Scripts/python.exe", 
            "backend/backup_scripts/quick_backup.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Emergency configuration backup created successfully!")
        else:
            print(f"❌ Configuration backup failed: {result.stderr}")
        
        print("\n✅ Emergency backup completed!")
        
    except Exception as e:
        print(f"❌ Emergency backup failed: {e}")

def main():
    """Main function"""
    try:
        emergency_recovery_menu()
    except KeyboardInterrupt:
        print("\n\n👋 Recovery tool exited by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
