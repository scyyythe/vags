"""
Asynchronous content moderation utilities
"""
import asyncio
import aiohttp
import logging
from typing import List, Dict, Any
from django.utils import timezone

logger = logging.getLogger(__name__)

class AsyncContentModerator:
    """Handle content moderation asynchronously"""
    
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.api_user = '544238500'
        self.api_secret = 'qHH4NsVSUeNtnC7BcFToa2qn542ZaKF2'
    
    async def moderate_image_async(self, image_url: str) -> Dict[str, Any]:
        """
        Moderate image content asynchronously
        Returns dict with moderation result and metadata
        """
        url = "https://api.sightengine.com/1.0/check.json"
        params = {
            'url': image_url,
            'models': 'nudity,wad',
            'api_user': self.api_user,
            'api_secret': self.api_secret,
        }
        
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout)) as session:
                async with session.get(url, params=params) as response:
                    response.raise_for_status()
                    result = await response.json()
                    
                    # Check for nudity content
                    is_appropriate = True
                    if 'nudity' in result:
                        nudity = result['nudity']
                        if nudity.get('raw', 0) > 0.5 or nudity.get('partial', 0) > 0.5:
                            is_appropriate = False
                    
                    return {
                        'url': image_url,
                        'is_appropriate': is_appropriate,
                        'moderation_data': result,
                        'timestamp': timezone.now(),
                        'status': 'completed'
                    }
                    
        except asyncio.TimeoutError:
            logger.error(f"Content moderation timeout for image: {image_url}")
            return {
                'url': image_url,
                'is_appropriate': True,  # Allow on timeout to avoid blocking
                'moderation_data': None,
                'timestamp': timezone.now(),
                'status': 'timeout'
            }
            
        except aiohttp.ClientError as e:
            logger.error(f"Content moderation API error for image {image_url}: {str(e)}")
            return {
                'url': image_url,
                'is_appropriate': True,  # Allow on API error to avoid blocking
                'moderation_data': None,
                'timestamp': timezone.now(),
                'status': 'api_error'
            }
            
        except Exception as e:
            logger.error(f"Unexpected error in async content moderation for image {image_url}: {str(e)}")
            return {
                'url': image_url,
                'is_appropriate': True,  # Allow on unexpected error
                'moderation_data': None,
                'timestamp': timezone.now(),
                'status': 'error'
            }
    
    async def moderate_images_batch(self, image_urls: List[str]) -> List[Dict[str, Any]]:
        """
        Moderate multiple images concurrently
        """
        tasks = [self.moderate_image_async(url) for url in image_urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions that occurred
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Exception in batch moderation for image {image_urls[i]}: {str(result)}")
                processed_results.append({
                    'url': image_urls[i],
                    'is_appropriate': True,  # Allow on exception
                    'moderation_data': None,
                    'timestamp': timezone.now(),
                    'status': 'exception'
                })
            else:
                processed_results.append(result)
        
        return processed_results


# Utility function for easy integration
async def moderate_images_async(image_urls: List[str], timeout: int = 10) -> List[Dict[str, Any]]:
    """
    Convenience function for async image moderation
    """
    moderator = AsyncContentModerator(timeout=timeout)
    return await moderator.moderate_images_batch(image_urls)


# Synchronous wrapper for backward compatibility
def moderate_images_sync_wrapper(image_urls: List[str], timeout: int = 10) -> List[Dict[str, Any]]:
    """
    Synchronous wrapper for async moderation (use sparingly)
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(moderate_images_async(image_urls, timeout))
    finally:
        loop.close()
