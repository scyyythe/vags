"""
Upload optimization utilities
"""
import asyncio
import aiohttp
import cloudinary.uploader
import cloudinary.api
from typing import List, Dict, Any, Tuple
from concurrent.futures import ThreadPoolExecutor
import logging

logger = logging.getLogger(__name__)

class UploadOptimizer:
    """Optimized upload handling with parallel processing"""
    
    def __init__(self, max_workers: int = 3):
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
    
    def _upload_single_image(self, image_data: Tuple[int, Any]) -> Tuple[int, Dict[str, Any]]:
        """Upload a single image with optimization"""
        index, img = image_data
        
        try:
            # Use signed upload with transformations for better performance
            result = cloudinary.uploader.upload(
                img,
                folder="artworks",
                # Optimize images during upload
                transformation=[
                    {"quality": "auto", "fetch_format": "auto"},
                    {"width": 1920, "height": 1920, "crop": "limit"}
                ],
                # Add timeout
                timeout=30,
                # Additional optimization parameters
                eager=[
                    {"width": 800, "height": 800, "crop": "limit", "quality": "auto"},
                    {"width": 400, "height": 400, "crop": "limit", "quality": "auto"}
                ]
            )
            
            return index, {
                "success": True,
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "bytes": result.get("bytes", 0),
                "width": result.get("width", 0),
                "height": result.get("height", 0)
            }
            
        except Exception as e:
            logger.error(f"Upload failed for image {index}: {str(e)}")
            return index, {
                "success": False,
                "error": str(e),
                "url": None
            }
    
    def upload_images_parallel(self, images: List[Any]) -> List[Dict[str, Any]]:
        """Upload multiple images in parallel"""
        if not images:
            return []
        
        # Prepare image data with indices
        image_data = [(i, img) for i, img in enumerate(images)]
        
        # Upload images in parallel
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            results = list(executor.map(self._upload_single_image, image_data))
        
        # Sort results by original index
        results.sort(key=lambda x: x[0])
        
        # Extract upload results
        upload_results = [result[1] for result in results]
        
        # Check for any failures
        failed_uploads = [i for i, result in enumerate(upload_results) if not result["success"]]
        if failed_uploads:
            logger.warning(f"Failed uploads for images: {failed_uploads}")
        
        return upload_results
    
    def cleanup_failed_uploads(self, upload_results: List[Dict[str, Any]]):
        """Clean up any partially uploaded images"""
        for result in upload_results:
            if result["success"] and result.get("public_id"):
                try:
                    cloudinary.uploader.destroy(result["public_id"])
                    logger.info(f"Cleaned up failed upload: {result['public_id']}")
                except Exception as e:
                    logger.error(f"Failed to cleanup {result['public_id']}: {str(e)}")
    
    def get_upload_stats(self, upload_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about the upload process"""
        successful = [r for r in upload_results if r["success"]]
        failed = [r for r in upload_results if not r["success"]]
        
        total_bytes = sum(r.get("bytes", 0) for r in successful)
        
        return {
            "total_images": len(upload_results),
            "successful": len(successful),
            "failed": len(failed),
            "total_bytes": total_bytes,
            "average_size": total_bytes / len(successful) if successful else 0,
            "failure_rate": len(failed) / len(upload_results) if upload_results else 0
        }


# Global upload optimizer instance
upload_optimizer = UploadOptimizer(max_workers=3)
