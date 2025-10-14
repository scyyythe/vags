from rest_framework import serializers
from api.models.user_model.two_factor_auth import TwoFactorAuth
from api.models.user_model.users import User


class TwoFactorAuthSerializer(serializers.ModelSerializer):
    """
    Serializer for TwoFactorAuth model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TwoFactorAuth
        fields = [
            'id',
            'user',
            'user_email',
            'user_username',
            'is_enabled',
            'method',
            'setup_completed',
            'phone_verified',
            'backup_email_verified',
            'backup_codes_generated_at',
            'trusted_devices',
            'max_trusted_devices',
            'failed_attempts',
            'last_failed_attempt',
            'locked_until',
            'enabled_at',
            'disabled_at',
            'last_used',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'user',
            'user_email',
            'user_username',
            'backup_codes_generated_at',
            'trusted_devices',
            'failed_attempts',
            'last_failed_attempt',
            'locked_until',
            'enabled_at',
            'disabled_at',
            'last_used',
            'created_at',
            'updated_at'
        ]


class TwoFactorSetupSerializer(serializers.Serializer):
    """
    Serializer for 2FA setup request
    """
    method = serializers.ChoiceField(choices=['totp', 'sms', 'email'])
    phone_number = serializers.CharField(required=False, allow_blank=True)
    backup_email = serializers.EmailField(required=False, allow_blank=True)
    
    def validate(self, data):
        method = data.get('method')
        phone_number = data.get('phone_number')
        backup_email = data.get('backup_email')
        
        if method == 'sms' and not phone_number:
            raise serializers.ValidationError('Phone number is required for SMS 2FA')
        
        if method == 'email' and not backup_email:
            raise serializers.ValidationError('Backup email is required for email 2FA')
        
        return data


class TwoFactorVerificationSerializer(serializers.Serializer):
    """
    Serializer for 2FA verification request
    """
    code = serializers.CharField(required=False, allow_blank=True)
    backup_code = serializers.CharField(required=False, allow_blank=True)
    device_fingerprint = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        code = data.get('code')
        backup_code = data.get('backup_code')
        
        if not code and not backup_code:
            raise serializers.ValidationError('Either code or backup_code is required')
        
        if code and backup_code:
            raise serializers.ValidationError('Provide either code or backup_code, not both')
        
        return data


class TwoFactorDisableSerializer(serializers.Serializer):
    """
    Serializer for disabling 2FA
    """
    password = serializers.CharField()


class TwoFactorBackupCodesSerializer(serializers.Serializer):
    """
    Serializer for backup codes operations
    """
    password = serializers.CharField()


class TwoFactorStatusSerializer(serializers.Serializer):
    """
    Serializer for 2FA status response
    """
    two_factor_enabled = serializers.BooleanField()
    two_factor_method = serializers.CharField()
    two_factor_setup_completed = serializers.BooleanField()
    remaining_backup_codes = serializers.IntegerField()
    trusted_devices_count = serializers.IntegerField()
