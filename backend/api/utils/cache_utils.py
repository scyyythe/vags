
from django.core.cache import cache

def get_cached_data(cache_key):

    return cache.get(cache_key)

def set_cache_data(cache_key, data, timeout=3600):
  
    cache.set(cache_key, data, timeout)

def delete_cache_data(cache_key):
  
    cache.delete(cache_key)
