
from django.core.cache import cache

def get_cached_data(cache_key):
    return cache.get(cache_key)

def set_cache_data(cache_key, data, timeout=3600):
    cache.set(cache_key, data, timeout)

def delete_cache_data(cache_key):
    cache.delete(cache_key)

# Alias functions for 2FA compatibility
def cache_get(cache_key):
    """Get data from cache"""
    return cache.get(cache_key)

def cache_set(cache_key, data, timeout=3600):
    """Set data in cache"""
    cache.set(cache_key, data, timeout)

def clear_all_artwork_caches():
    """Clear all artwork-related cache keys"""
    from api.models.user_model.users import User
    
    # Clear anonymous user cache
    cache.delete("artworks_for_sale_anonymous")
    print("DEBUG: Cleared anonymous cache")
    
    # Clear popular artworks cache
    cache.delete("popular_artworks_top5")
    print("DEBUG: Cleared popular artworks cache")
    
    # Clear all user-specific caches (MongoEngine compatible approach)
    try:
        # Get all user IDs using MongoEngine syntax
        users = User.objects.only('id')
        print(f"DEBUG: Found {users.count()} users to clear caches for")
        for user in users:
            cache_key = f"artworks_for_sale_{user.id}"
            cache.delete(cache_key)
            print(f"DEBUG: Cleared cache for user: {user.id}")
    except Exception as e:
        print(f"Warning: Could not clear user-specific caches: {e}")

def clear_artwork_caches_for_user(user_id=None):
    """Clear artwork caches for specific user or anonymous"""
    if user_id:
        cache.delete(f"artworks_for_sale_{user_id}")
        cache.delete(f"user_exclusions_{user_id}")
    else:
        cache.delete("artworks_for_sale_anonymous")
        cache.delete("user_exclusions_anonymous")
    print(f"Cleared artwork caches for user: {user_id or 'anonymous'}")
    