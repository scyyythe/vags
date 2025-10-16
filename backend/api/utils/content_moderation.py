import requests
import logging

logger = logging.getLogger(__name__)

def moderate_image(image_url, timeout=10):
    """
    Moderate image content using SightEngine API with timeout
    Returns True if image is appropriate, False otherwise
    """
    API_USER = '544238500'    
    API_SECRET = 'qHH4NsVSUeNtnC7BcFToa2qn542ZaKF2'  

    url = "https://api.sightengine.com/1.0/check.json"
    params = {
        'url': image_url,
        'models': 'nudity,wad',  
        'api_user': API_USER,
        'api_secret': API_SECRET,
    }

    try:
        # Add timeout to prevent hanging requests
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()  # Raise exception for HTTP errors
        result = response.json()

        # Check for nudity content
        if 'nudity' in result:
            nudity = result['nudity']
            
            if nudity.get('raw', 0) > 0.5 or nudity.get('partial', 0) > 0.5:
                logger.warning(f"Image flagged for inappropriate content: {image_url}")
                return False
        
        logger.info(f"Image passed moderation: {image_url}")
        return True
        
    except requests.exceptions.Timeout:
        logger.error(f"Content moderation timeout for image: {image_url}")
        # In case of timeout, allow the image to pass to avoid blocking users
        # You might want to implement a queue system for retry later
        return True
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Content moderation API error for image {image_url}: {str(e)}")
        # In case of API error, allow the image to pass to avoid blocking users
        return True
        
    except Exception as e:
        logger.error(f"Unexpected error in content moderation for image {image_url}: {str(e)}")
        return True 
