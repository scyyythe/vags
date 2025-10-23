# 🚨 VAGS DISASTER RECOVERY GUIDE

## 📋 **HOW YOUR BACKUP SYSTEM WORKS**

### **🔄 Current Backup Strategy:**

Your VAGS system now has **3 layers of protection**:

1. **☁️ Cloud Storage (Primary)**
   - **Database:** MongoDB Atlas (cloud-hosted)
   - **Images/Media:** Cloudinary (cloud-hosted)
   - **Status:** Always available, redundant

2. **💾 Local Backups (Secondary)**
   - **Database Backups:** JSON files with all your data
   - **Configuration Backups:** Settings, requirements, Docker files
   - **Location:** `backend/backups/`

3. **🛡️ Application-Level Recovery**
   - **Soft Delete System:** Items marked as deleted, not permanently removed
   - **Restore Functions:** Users can restore deleted content
   - **Built-in Recovery:** 2FA backup codes, user account recovery

---

## 🚨 **DISASTER SCENARIOS & RECOVERY PROCEDURES**

### **Scenario 1: Complete System Failure**
**What happens:** Your entire server/computer crashes

**Recovery Steps:**
1. **Access your cloud services:**
   - MongoDB Atlas: Your database is still there
   - Cloudinary: Your images are still there
   - Just need to redeploy your application

2. **Restore from local backups:**
   ```bash
   # Restore database from backup
   mongoimport --uri "your_mongodb_uri" --collection users --file backend/backups/python_backups/user_20251023_235347.json
   
   # Restore configuration files
   copy backend/backups/quick_backups/config_20251023_235037/* backend/
   ```

### **Scenario 2: Database Corruption**
**What happens:** Your database gets corrupted or data is lost

**Recovery Steps:**
1. **Stop your application**
2. **Restore from backup:**
   ```bash
   # List available database backups
   backend\env\Scripts\python.exe backend\backup_scripts\show_backups.py
   
   # Restore specific collection
   mongoimport --uri "your_mongodb_uri" --collection users --file backend/backups/python_backups/user_20251023_235347.json
   ```

### **Scenario 3: File/Configuration Loss**
**What happens:** Your application files get deleted or corrupted

**Recovery Steps:**
1. **Restore configuration files:**
   ```bash
   # Copy backup files to original locations
   copy backend/backups/quick_backups/config_20251023_235037/settings.py backend/backend/
   copy backend/backups/quick_backups/config_20251023_235037/requirements.txt backend/
   copy backend/backups/quick_backups/config_20251023_235037/docker-compose.yml ./
   ```

### **Scenario 4: Partial Data Loss**
**What happens:** Some users or artworks get accidentally deleted

**Recovery Steps:**
1. **Use application restore features:**
   - Admin can restore deleted users
   - Users can restore deleted artworks
   - Built-in restore functions in your system

2. **Restore from backup if needed:**
   ```bash
   # Restore specific collection
   mongoimport --uri "your_mongodb_uri" --collection art --file backend/backups/python_backups/art_20251023_235347.json
   ```

---

## 🔧 **RECOVERY COMMANDS REFERENCE**

### **View All Backups:**
```bash
backend\env\Scripts\python.exe backend\backup_scripts\show_backups.py
```

### **Create New Backup:**
```bash
# Quick backup (configuration)
backend\env\Scripts\python.exe backend\backup_scripts\quick_backup.py

# Database backup
backend\env\Scripts\python.exe backend\backup_scripts\python_backup.py
```

### **Restore Database Collection:**
```bash
# Example: Restore users
mongoimport --uri "mongodb+srv://canete:Canete062723%21@cluster0.lngnj.mongodb.net/virtual_art?retryWrites=true&w=majority&authSource=admin" --collection users --file backend/backups/python_backups/user_20251023_235347.json

# Example: Restore artworks
mongoimport --uri "mongodb+srv://canete:Canete062723%21@cluster0.lngnj.mongodb.net/virtual_art?retryWrites=true&w=majority&authSource=admin" --collection art --file backend/backups/python_backups/art_20251023_235347.json
```

### **Restore Configuration Files:**
```bash
# Copy backup files to original locations
copy backend/backups/quick_backups/config_20251023_235037/settings.py backend/backend/
copy backend/backups/quick_backups/config_20251023_235037/requirements.txt backend/
copy backend/backups/quick_backups/config_20251023_235037/docker-compose.yml ./
```

---

## 📊 **BACKUP MANAGEMENT**

### **Regular Backup Schedule:**
- **Daily:** Quick backup before major changes
- **Weekly:** Full database backup
- **Monthly:** Complete system backup

### **Backup Retention:**
- **Keep:** Last 30 days of backups
- **Archive:** Monthly backups for long-term storage
- **Cleanup:** Automatic cleanup of old backups

### **Monitoring Backups:**
```bash
# Check backup status
backend\env\Scripts\python.exe backend\backup_scripts\show_backups.py

# List database backups
backend\env\Scripts\python.exe backend\backup_scripts\python_backup.py list

# List quick backups
backend\env\Scripts\python.exe backend\backup_scripts\quick_backup.py list
```

---

## 🛡️ **PREVENTION STRATEGIES**

### **Before Making Changes:**
1. **Always create a backup:**
   ```bash
   backend\env\Scripts\python.exe backend\backup_scripts\python_backup.py
   ```

2. **Test changes in development first**

3. **Keep backup files safe** (copy to external storage)

### **Regular Maintenance:**
1. **Weekly backup checks**
2. **Monthly restore tests**
3. **Monitor backup file sizes**
4. **Verify backup integrity**

---

## 🆘 **EMERGENCY RECOVERY PROCEDURES**

### **Complete System Recovery:**
1. **Stop all services**
2. **Restore database from latest backup**
3. **Restore configuration files**
4. **Restart services**
5. **Verify system functionality**

### **Partial Recovery:**
1. **Identify what's missing**
2. **Restore specific collections/files**
3. **Test functionality**
4. **Update backup after recovery**

---

## 📞 **CONTACT INFORMATION**

### **Your System Details:**
- **Database:** MongoDB Atlas (cloud)
- **Images:** Cloudinary (cloud)
- **Backup Location:** `D:\vags\backend\backups\`
- **Last Backup:** October 23, 2025

### **Recovery Time Objectives:**
- **Database Recovery:** 15-30 minutes
- **Configuration Recovery:** 5-10 minutes
- **Complete System Recovery:** 1-2 hours

---

## ✅ **RECOVERY CHECKLIST**

### **Before Disaster:**
- [ ] Regular backups scheduled
- [ ] Backup files verified
- [ ] Recovery procedures tested
- [ ] Documentation updated

### **During Disaster:**
- [ ] Assess the damage
- [ ] Stop affected services
- [ ] Identify recovery method
- [ ] Execute recovery plan
- [ ] Verify functionality

### **After Recovery:**
- [ ] Test all functions
- [ ] Create new backup
- [ ] Update documentation
- [ ] Review prevention measures

---

**Remember:** Your data is protected by multiple layers. Even if one fails, you have backups and cloud redundancy to recover from any disaster.
