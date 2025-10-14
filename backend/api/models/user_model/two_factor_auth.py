from mongoengine import Document, StringField, BooleanField, ListField, EmailField, DateTimeField, ReferenceField, IntField
from datetime import datetime, timedelta
from api.models.user_model.users import User


class TwoFactorAuth(Document):
    """
    Two-Factor Authentication settings for a user
    """
    user = ReferenceField(User, required=True, unique=True)
    
    # 2FA Status
    is_enabled = BooleanField(default=False)
    enabled_methods = ListField(StringField(choices=["totp", "sms", "email"]), default=list)
    primary_method = StringField(choices=["totp", "sms", "email"], default="totp")
    setup_completed = BooleanField(default=False)
    
    # TOTP Settings
    totp_secret = StringField(required=False)
    totp_verified = BooleanField(default=False)
    
    # Backup Codes
    backup_codes = ListField(StringField(), default=list)
    backup_codes_generated_at = DateTimeField(required=False)
    
    # SMS Settings
    phone_number = StringField(required=False)
    phone_verified = BooleanField(default=False)
    
    # Email Settings
    backup_email = EmailField(required=False)
    backup_email_verified = BooleanField(default=False)
    
    # Security Settings
    trusted_devices = ListField(StringField(), default=list)  # Device fingerprints
    max_trusted_devices = IntField(default=5)
    
    # Rate Limiting
    failed_attempts = IntField(default=0)
    last_failed_attempt = DateTimeField(required=False)
    locked_until = DateTimeField(required=False)
    
    # Audit Trail
    enabled_at = DateTimeField(required=False)
    disabled_at = DateTimeField(required=False)
    last_used = DateTimeField(required=False)
    
    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'two_factor_auth',
        'indexes': [
            'user',
            'is_enabled',
            'enabled_methods',
            'primary_method',
            'setup_completed'
        ]
    }
    
    def save(self, *args, **kwargs):
        """Override save to update timestamps"""
        self.updated_at = datetime.utcnow()
        return super(TwoFactorAuth, self).save(*args, **kwargs)
    
    def enable_method(self, method="totp"):
        """Enable a specific 2FA method for the user"""
        if method not in self.enabled_methods:
            self.enabled_methods.append(method)
        
        if not self.is_enabled:
            self.is_enabled = True
            self.primary_method = method
            self.enabled_at = datetime.utcnow()
            self.disabled_at = None
        
        self.setup_completed = True
        self.save()
    
    def disable_method(self, method):
        """Disable a specific 2FA method"""
        if method in self.enabled_methods:
            self.enabled_methods.remove(method)
            
            # If this was the primary method, switch to another enabled method
            if self.primary_method == method and self.enabled_methods:
                self.primary_method = self.enabled_methods[0]
            elif not self.enabled_methods:
                # No methods left, disable 2FA entirely
                self.is_enabled = False
                self.setup_completed = False
                self.disabled_at = datetime.utcnow()
            
            self.save()
    
    def set_primary_method(self, method):
        """Set the primary 2FA method"""
        if method in self.enabled_methods:
            self.primary_method = method
            self.save()
    
    def get_available_methods(self):
        """Get list of available 2FA methods"""
        return self.enabled_methods
    
    def is_method_enabled(self, method):
        """Check if a specific method is enabled"""
        return method in self.enabled_methods
    
    def disable(self):
        """Disable 2FA for the user"""
        self.is_enabled = False
        self.setup_completed = False
        self.disabled_at = datetime.utcnow()
        
        # Clear all methods and verification status
        self.enabled_methods = []
        self.primary_method = "totp"  # Reset to default
        self.totp_verified = False
        self.phone_verified = False
        self.backup_email_verified = False
        
        # Clear sensitive data
        self.totp_secret = None
        self.backup_codes = []
        self.phone_number = None
        self.backup_email = None
        self.trusted_devices = []
        self.failed_attempts = 0
        self.last_failed_attempt = None
        self.locked_until = None
        
        self.save()
    
    def add_trusted_device(self, device_fingerprint):
        """Add a trusted device"""
        if device_fingerprint not in self.trusted_devices:
            if len(self.trusted_devices) >= self.max_trusted_devices:
                # Remove oldest device if at limit
                self.trusted_devices.pop(0)
            self.trusted_devices.append(device_fingerprint)
            self.save()
    
    def remove_trusted_device(self, device_fingerprint):
        """Remove a trusted device"""
        if device_fingerprint in self.trusted_devices:
            self.trusted_devices.remove(device_fingerprint)
            self.save()
    
    def is_device_trusted(self, device_fingerprint):
        """Check if device is trusted"""
        return device_fingerprint in self.trusted_devices
    
    def record_failed_attempt(self):
        """Record a failed 2FA attempt"""
        self.failed_attempts += 1
        self.last_failed_attempt = datetime.utcnow()
        
        # Lock account after 5 failed attempts for 15 minutes
        if self.failed_attempts >= 5:
            self.locked_until = datetime.utcnow() + timedelta(minutes=15)
        
        self.save()
    
    def reset_failed_attempts(self):
        """Reset failed attempts counter"""
        self.failed_attempts = 0
        self.last_failed_attempt = None
        self.locked_until = None
        self.save()
    
    def is_locked(self):
        """Check if 2FA is currently locked"""
        if self.locked_until:
            return datetime.utcnow() < self.locked_until
        return False
    
    def generate_backup_codes(self, count=10):
        """Generate new backup codes"""
        import secrets
        import string
        
        codes = []
        for _ in range(count):
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            codes.append(code)
        
        self.backup_codes = codes
        self.backup_codes_generated_at = datetime.utcnow()
        self.save()
        
        return codes
    
    def use_backup_code(self, code):
        """Use a backup code (removes it from the list)"""
        if code in self.backup_codes:
            self.backup_codes.remove(code)
            self.last_used = datetime.utcnow()
            self.save()
            return True
        return False
    
    def get_remaining_backup_codes(self):
        """Get count of remaining backup codes"""
        return len(self.backup_codes)
    
    def update_last_used(self):
        """Update last used timestamp"""
        self.last_used = datetime.utcnow()
        self.save()
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Get or create 2FA settings for a user"""
        two_factor = cls.objects(user=user).first()
        if not two_factor:
            two_factor = cls(user=user)
            two_factor.save()
        return two_factor
    
    @classmethod
    def get_enabled_users(cls):
        """Get all users with 2FA enabled"""
        return cls.objects(is_enabled=True)
    
    @classmethod
    def get_users_by_method(cls, method):
        """Get users using specific 2FA method"""
        return cls.objects(is_enabled=True, enabled_methods__in=[method])
