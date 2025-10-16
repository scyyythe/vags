
import hashlib
import hmac
import time
from django.conf import settings

def generate_cloudinary_signature(folder="artworks", transformations=None):
    """
    Generate signed upload parameters for Cloudinary with optional transformations
    """
    timestamp = int(time.time())
    
    # Base parameters
    params = {
        "timestamp": timestamp,
        "folder": folder,
    }
    
    # Add transformations if provided
    if transformations:
        params["transformation"] = transformations
    
    # Sort parameters for consistent signing
    sorted_params = sorted(params.items())
    params_to_sign = "&".join([f"{key}={value}" for key, value in sorted_params])

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
        "folder": folder,
        "transformation": transformations,
    }
