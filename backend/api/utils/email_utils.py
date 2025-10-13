from django.core.mail import send_mail
import random
from datetime import datetime
from api.utils.cache_utils import cache_set, cache_get


def generate_otp():
    return ''.join(random.choices('0123456789', k=6))

def send_otp_email(email, otp):
    subject = "Your OTP Verification Code"
    message = f"Your OTP code is: {otp}. It will expire in 5 minutes."
    from_email = "your-email@gmail.com"
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)


def send_2fa_verification_email(email, otp, username="User"):
    """Send 2FA verification email with nice HTML formatting"""
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">

        <h2 style="color: #b91c1c; text-align: center;">Two-Factor Authentication</h2>
        <p style="font-size: 14px; color: #333;">
            Hi {username},<br/><br/>
            You're setting up two-factor authentication for your VAGS Art Platform account.<br/>
            Use the following verification code to complete the setup:
        </p>

        <div style="background-color: #f8f9fa; border: 2px dashed #b91c1c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #b91c1c; margin: 0; letter-spacing: 4px;">
                {otp}
            </p>
        </div>

        <p style="font-size: 12px; color: #555; text-align: center;">
            This verification code will expire in 5 minutes.<br/>
            If you did not request this code, please ignore this email and secure your account.
        </p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; {datetime.utcnow().year} VAGS Art Platform. All rights reserved.
        </p>
    </div>
    """

    send_mail(
        subject='Worxist Art Platform | 2FA Verification Code',
        message=f'Your 2FA verification code is: {otp}. It expires in 5 minutes.',
        from_email='Worxist Art Platform <caneteangel327@gmail.com>',
        recipient_list=[email],
        html_message=html_content,
        fail_silently=False,
    )


def send_2fa_login_code(email, otp, username="User"):
    """Send 2FA login verification email"""
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">

        <h2 style="color: #b91c1c; text-align: center;">Login Verification</h2>
        <p style="font-size: 14px; color: #333;">
            Hi {username},<br/><br/>
            Someone is trying to log into your Worxist Art Platform account.<br/>
            Use the following verification code to complete the login:
        </p>

        <div style="background-color: #f8f9fa; border: 2px dashed #b91c1c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #b91c1c; margin: 0; letter-spacing: 4px;">
                {otp}
            </p>
        </div>

        <p style="font-size: 12px; color: #555; text-align: center;">
            This verification code will expire in 5 minutes.<br/>
            If this wasn't you, please secure your account immediately.
        </p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; {datetime.utcnow().year} Worxist Art Platform. All rights reserved.
        </p>
    </div>
    """

    send_mail(
        subject='Worxist Art Platform | Login Verification Code',
        message=f'Your login verification code is: {otp}. It expires in 5 minutes.',
        from_email='Worxist Art Platform <caneteangel327@gmail.com>',
        recipient_list=[email],
        html_message=html_content,
        fail_silently=False,
    )


def send_2fa_email_code(email, user_id, purpose="2FA", username="User"):
    """Send 2FA email code and store it in cache"""
    otp = generate_otp()
    
    # Store code in cache for verification (expires in 5 minutes)
    cache_key = f"email_verification_{user_id}_{purpose}"
    cache_data = {
        'code': otp,
        'email': email,
        'created_at': datetime.utcnow().isoformat(),
        'attempts': 0,
        'max_attempts': 3
    }
    cache_set(cache_key, cache_data, 300)  # 5 minutes
    
    # Send email based on purpose
    if purpose == "login":
        send_2fa_login_code(email, otp, username)
    else:
        send_2fa_verification_email(email, otp, username)
    
    return {
        'success': True,
        'message': 'Verification code sent to your email',
        'email': email
    }


def verify_2fa_email_code(email, code, user_id, purpose="2FA"):
    """Verify 2FA email code"""
    cache_key = f"email_verification_{user_id}_{purpose}"
    cache_data = cache_get(cache_key)
    
    if not cache_data:
        return {
            'success': False,
            'message': 'Verification code not found or expired'
        }
    
    # Check attempts
    if cache_data.get('attempts', 0) >= cache_data.get('max_attempts', 3):
        # Remove from cache after max attempts
        cache_set(cache_key, None, 0)
        return {
            'success': False,
            'message': 'Too many failed attempts. Please request a new code.'
        }
    
    # Verify code
    if cache_data['code'] == code:
        # Success - remove from cache
        cache_set(cache_key, None, 0)
        return {
            'success': True,
            'message': 'Code verified successfully'
        }
    else:
        # Increment attempts
        cache_data['attempts'] += 1
        cache_set(cache_key, cache_data, 300)
        remaining_attempts = cache_data.get('max_attempts', 3) - cache_data['attempts']
        
        return {
            'success': False,
            'message': f'Invalid code. {remaining_attempts} attempts remaining.'
        }
