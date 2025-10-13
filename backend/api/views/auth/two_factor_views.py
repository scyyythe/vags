import pyotp
import qrcode
import io
import base64
import secrets
import string
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from api.models.user_model.two_factor_auth import TwoFactorAuth
from api.utils.email_utils import send_otp_email
from api.utils.cache_utils import cache_set, cache_get
import json


class TwoFactorSetupView(APIView):
    """
    Initialize 2FA setup - generates TOTP secret and QR code
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        method = request.data.get('method', 'totp')
        
        # Get or create 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)

        # Check if this specific method is already enabled
        if two_factor.is_method_enabled(method):
            return Response(
                {'error': f'{method.upper()} 2FA is already enabled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if method == 'totp':
            # Generate TOTP secret
            secret = pyotp.random_base32()
            
            # Create TOTP object
            totp = pyotp.TOTP(secret)
            
            # Generate provisioning URI
            provisioning_uri = totp.provisioning_uri(
                name=user.email,
                issuer_name="VAGS Art Platform"
            )
            
            # Generate QR code
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(provisioning_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Convert to base64
            qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            # Store secret temporarily in cache for verification
            cache_set(f"2fa_setup_{user.id}", secret, 300)  # 5 minutes
            print(f"DEBUG: Stored secret in cache for user {user.id}: {secret}")
            
            return Response({
                'secret': secret,
                'qr_code': qr_code_base64,
                'provisioning_uri': provisioning_uri
            })

        elif method == 'sms':
            phone_number = request.data.get('phone_number')
            if not phone_number:
                return Response(
                    {'error': 'Phone number is required for SMS 2FA'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Store phone number temporarily
            cache_set(f"2fa_setup_{user.id}", phone_number, 300)
            
            return Response({
                'message': 'SMS setup initiated. Phone number will be verified.'
            })

        elif method == 'email':
            backup_email = request.data.get('backup_email')
            if not backup_email:
                return Response(
                    {'error': 'Backup email is required for email 2FA'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Store backup email temporarily
            cache_set(f"2fa_setup_{user.id}", backup_email, 300)
            
            return Response({
                'message': 'Email setup initiated. Backup email will be verified.'
            })

        return Response(
            {'error': 'Invalid 2FA method'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class TwoFactorVerifySetupView(APIView):
    """
    Verify 2FA setup and enable it
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        method = request.data.get('method', 'totp')

        print(f"DEBUG: User {user.id}, Code: {code}, Method: {method}")

        if not code:
            return Response(
                {'error': 'Verification code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get setup data from cache
        setup_data = cache_get(f"2fa_setup_{user.id}")
        print(f"DEBUG: Setup data from cache: {setup_data}")
        
        if not setup_data:
            return Response(
                {'error': '2FA setup session expired. Please start over.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)

        if method == 'totp':
            # Verify TOTP code
            totp = pyotp.TOTP(setup_data)

            is_valid = totp.verify(code, valid_window=2)
  
            if not is_valid:
                return Response(
                    {'error': 'Invalid verification code. Please check your authenticator app and try again. Make sure your device time is synchronized.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save TOTP settings
            two_factor.totp_secret = setup_data
            two_factor.totp_verified = True
            two_factor.enable_method('totp')
            
            # Generate backup codes
            backup_codes = two_factor.generate_backup_codes()

        elif method == 'sms':
            # For SMS, we'd typically send an OTP to verify the phone number
            # This is a simplified version
            two_factor.phone_number = setup_data
            two_factor.phone_verified = True
            two_factor.enable_method('sms')

        elif method == 'email':
            # For email, we'd typically send an OTP to verify the backup email
            # This is a simplified version
            two_factor.backup_email = setup_data
            two_factor.backup_email_verified = True
            two_factor.enable_method('email')

        # Clear setup cache
        cache_set(f"2fa_setup_{user.id}", None, 0)

        return Response({
            'message': 'Two-factor authentication enabled successfully',
            'backup_codes': backup_codes if method == 'totp' else None
        })

    def _generate_backup_code(self):
        """Generate a random backup code"""
        return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))


class TwoFactorVerifyView(APIView):
    """
    Verify 2FA code during login
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        backup_code = request.data.get('backup_code')
        device_fingerprint = request.data.get('device_fingerprint')

        # Get 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)

        if not two_factor.is_enabled:
            return Response(
                {'error': 'Two-factor authentication is not enabled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if 2FA is locked
        if two_factor.is_locked():
            return Response(
                {'error': 'Two-factor authentication is temporarily locked. Please try again later.'}, 
                status=status.HTTP_423_LOCKED
            )

        # Check if using backup code
        if backup_code:
            if two_factor.use_backup_code(backup_code):
                # Add device to trusted devices if fingerprint provided
                if device_fingerprint:
                    two_factor.add_trusted_device(device_fingerprint)
                
                two_factor.reset_failed_attempts()
                return Response({'message': 'Backup code verified successfully'})
            else:
                two_factor.record_failed_attempt()
                return Response(
                    {'error': 'Invalid backup code'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Verify TOTP code
        if two_factor.method == 'totp' and two_factor.totp_secret:
            totp = pyotp.TOTP(two_factor.totp_secret)
            if totp.verify(code, valid_window=1):
                # Add device to trusted devices if fingerprint provided
                if device_fingerprint:
                    two_factor.add_trusted_device(device_fingerprint)
                
                two_factor.reset_failed_attempts()
                two_factor.update_last_used()
                return Response({'message': '2FA code verified successfully'})
            else:
                two_factor.record_failed_attempt()
                return Response(
                    {'error': 'Invalid verification code'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # For SMS/Email methods, you'd implement OTP verification here
        elif two_factor.method in ['sms', 'email']:
            # This would typically involve checking against a stored OTP
            # For now, we'll return an error
            return Response(
                {'error': 'SMS/Email 2FA verification not implemented yet'}, 
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

        return Response(
            {'error': 'Invalid verification method'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class TwoFactorDisableView(APIView):
    """
    Disable 2FA
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        password = request.data.get('password')

        # Get 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)

        if not two_factor.is_enabled:
            return Response(
                {'error': 'Two-factor authentication is not enabled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify password before disabling
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Disable 2FA
        two_factor.disable()

        return Response({'message': 'Two-factor authentication disabled successfully'})


class TwoFactorBackupCodesView(APIView):
    """
    Get or regenerate backup codes
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)
        
        if not two_factor.is_enabled:
            return Response(
                {'error': 'Two-factor authentication is not enabled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'backup_codes': two_factor.backup_codes,
            'remaining_codes': two_factor.get_remaining_backup_codes()
        })

    def post(self, request):
        user = request.user
        password = request.data.get('password')

        # Get 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)

        if not two_factor.is_enabled:
            return Response(
                {'error': 'Two-factor authentication is not enabled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify password before regenerating
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate new backup codes
        backup_codes = two_factor.generate_backup_codes()

        return Response({
            'message': 'Backup codes regenerated successfully',
            'backup_codes': backup_codes
        })


class TwoFactorStatusView(APIView):
    """
    Get 2FA status and settings
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get 2FA settings for user
        two_factor = TwoFactorAuth.get_or_create_for_user(user)

        return Response({
            'two_factor_enabled': two_factor.is_enabled,
            'enabled_methods': two_factor.enabled_methods,
            'primary_method': two_factor.primary_method,
            'two_factor_setup_completed': two_factor.setup_completed,
            'remaining_backup_codes': two_factor.get_remaining_backup_codes(),
            'trusted_devices_count': len(two_factor.trusted_devices),
            'totp_verified': two_factor.totp_verified,
            'phone_verified': two_factor.phone_verified,
            'backup_email_verified': two_factor.backup_email_verified
        })
