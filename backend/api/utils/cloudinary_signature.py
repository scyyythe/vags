
import hashlib
import hmac
import time
from django.conf import settings

def generate_cloudinary_signature():
    timestamp = int(time.time())
    params_to_sign = f"timestamp={timestamp}"

    signature = hmac.new(
        key=settings.CLOUDINARY_API_SECRET.encode("utf-8"),
        msg=params_to_sign.encode("utf-8"),
        digestmod=hashlib.sha1
    ).hexdigest()

    return {
        "timestamp": timestamp,
        "signature": signature,
        "api_key": settings.CLOUDINARY_API_KEY,
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
    }
