from django.core.mail import send_mail
import random
from datetime import datetime, timedelta

def generate_otp():
    return ''.join(random.choices('0123456789', k=6))

def send_otp_email(email, otp):
    subject = "Your OTP Verification Code"
    message = f"Your OTP code is: {otp}. It will expire in 5 minutes."
    from_email = "your-email@gmail.com"
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)
