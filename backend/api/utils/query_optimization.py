"""
Query optimization utilities for artwork-related operations
"""
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.interaction import Like
from api.models.interaction_model.hidden_content import HiddenContent
from api.models.payment_model.payment_accounts import PaymentAccount
from api.utils.cache_utils import get_cached_data, set_cache_data
from bson import ObjectId
from mongoengine.queryset.visitor import Q


def get_user_exclusions(user):
    """
    Get blocked user IDs and hidden artwork IDs for a user
    Returns tuple: (blocked_user_ids, hidden_artwork_ids)
    """
    cache_key = f"user_exclusions_{user.id if user.is_authenticated else 'anonymous'}"
    cached_data = get_cached_data(cache_key)
    
    if cached_data:
        return cached_data
    
    blocked_user_ids = []
    hidden_artwork_ids = []
    
    if user.is_authenticated and hasattr(user, 'blocked_users'):
        blocked_user_ids = [str(blocked_user.id) for blocked_user in user.blocked_users]
    
    # Get deactivated and scheduled for deletion user IDs
    deactivated_user_ids = User.objects(user_status__iexact="deactivated").scalar('id')
    scheduled_deletion_user_ids = User.objects(user_status__iexact="scheduled_for_deletion").scalar('id')
    
    # Combine all excluded user IDs
    all_excluded_user_ids = list(blocked_user_ids) + list(deactivated_user_ids) + list(scheduled_deletion_user_ids)
    
    # Filter out hidden artworks for the current user
    if user.is_authenticated:
        try:
            mongo_user = User.objects.get(id=ObjectId(user.id))
            hidden_contents = HiddenContent.objects.filter(user=mongo_user, content_type='artwork')
            if hidden_contents:
                hidden_artwork_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
        except Exception as e:
            # If there's an error getting hidden artworks, just continue without filtering
            pass
    
    result = (all_excluded_user_ids, hidden_artwork_ids)
    
    # Cache for 5 minutes
    set_cache_data(cache_key, result, 300)
    
    return result


def get_artworks_with_likes_count(artworks):
    """
    Get artworks with their like counts in an optimized way
    Returns list of tuples: [(artwork, like_count), ...]
    """
    if not artworks:
        return []
    
    artwork_ids = [art.id for art in artworks]
    
    # Use aggregation to get like counts for all artworks in one query
    pipeline = [
        {'$match': {'art': {'$in': artwork_ids}}},
        {'$group': {'_id': '$art', 'count': {'$sum': 1}}}
    ]
    
    likes_data = Like.objects.aggregate(pipeline)
    likes_dict = {like_data['_id']: like_data['count'] for like_data in likes_data}
    
    # Create result with like counts
    result = []
    for art in artworks:
        like_count = likes_dict.get(art.id, 0)
        result.append((art, like_count))
    
    return result


def get_popular_artworks(limit=5, user=None):
    """
    Get popular artworks optimized for performance
    """
    cache_key = f"popular_artworks_{limit}"
    cached_artworks = get_cached_data(cache_key)
    
    if cached_artworks:
        return cached_artworks
    
    excluded_user_ids, hidden_artwork_ids = get_user_exclusions(user)
    
    # Build query with exclusions
    query_filters = {
        'visibility__iexact': 'public',
        'art_status__iexact': 'active',
        'artist__nin': excluded_user_ids,
        'image_url__exists': True,
        'image_url__ne': []
    }
    
    if hidden_artwork_ids:
        query_filters['id__nin'] = hidden_artwork_ids
    
    artworks = Art.objects(**query_filters)
    
    # Get artworks with like counts
    artworks_with_likes = get_artworks_with_likes_count(artworks)
    
    # Sort by like count and take top N
    artworks_with_likes.sort(key=lambda x: x[1], reverse=True)
    top_artworks = [art for art, _ in artworks_with_likes[:limit]]
    
    # Cache for 10 minutes
    set_cache_data(cache_key, top_artworks, 600)
    
    return top_artworks


def prefetch_artwork_relations(artworks):
    """
    Prefetch related data for multiple artworks to avoid N+1 queries
    """
    if not artworks:
        return {
            'likes_data': [],
            'paypal_accounts': [],
            'artists': []
        }
    
    artwork_ids = [art.id for art in artworks]
    artist_ids = list(set([art.artist.id for art in artworks if art.artist]))
    
    try:
        # Prefetch likes data
        likes_pipeline = [
            {'$match': {'art': {'$in': artwork_ids}}},
            {'$group': {'_id': '$art', 'count': {'$sum': 1}}}
        ]
        likes_data = Like.objects.aggregate(likes_pipeline)
        
        # Prefetch PayPal accounts
        paypal_accounts = PaymentAccount.objects.filter(
            user__in=artist_ids,
            type="paypal",
            is_default=True
        )
        
        # Prefetch artist data
        artists = User.objects(id__in=artist_ids).only(
            'id', 'first_name', 'last_name', 'profile_picture'
        )
        
        return {
            'likes_data': list(likes_data),
            'paypal_accounts': list(paypal_accounts),
            'artists': list(artists)
        }
    except Exception as e:
        print(f"Error in prefetch_artwork_relations: {e}")
        return {
            'likes_data': [],
            'paypal_accounts': [],
            'artists': []
        }


def build_artwork_query_filters(user=None, visibility='public', art_status='active'):
    """
    Build optimized query filters for artwork queries
    """
    excluded_user_ids, hidden_artwork_ids = get_user_exclusions(user)
    
    filters = {
        'visibility__iexact': visibility,
        'artist__nin': excluded_user_ids
    }
    
    if art_status:
        if isinstance(art_status, list):
            filters['art_status__in'] = art_status
        else:
            filters['art_status__iexact'] = art_status
    
    if hidden_artwork_ids:
        filters['id__nin'] = hidden_artwork_ids
    
    return filters


def get_artworks_for_sale(user=None):
    """
    Get artworks available for sale with optimized query
    """
    cache_key = f"artworks_for_sale_{user.id if user and user.is_authenticated else 'anonymous'}"
    cached_artworks = get_cached_data(cache_key)
    
    if cached_artworks:
        return cached_artworks
    
    excluded_user_ids, hidden_artwork_ids = get_user_exclusions(user)
    
    # More flexible query with case-insensitive matching and fallbacks
    query = Q(visibility__iexact="public") & Q(artist__nin=excluded_user_ids) & (
        Q(art_status__iexact="onSale") |
        Q(art_status__iexact="onsale") |  # Handle lowercase variant
        (Q(edition__iexact="Open Edition") & Q(quantity__gt=0))
    ) & Q(art_status__ne="unlisted") & Q(art_status__ne="sold")
    
    if hidden_artwork_ids:
        query = query & Q(id__nin=hidden_artwork_ids)
    
    try:
        artworks = list(Art.objects(query).order_by("-created_at"))
        
        # If no results with strict filtering, try more lenient approach
        if not artworks:
            print(f"Warning: No artworks found with strict filtering. Trying lenient approach...")
            lenient_query = Q(visibility__iexact="public") & (
                Q(art_status__iexact="onSale") |
                Q(art_status__iexact="onsale")
            ) & Q(art_status__ne="sold")
            
            artworks = list(Art.objects(lenient_query).order_by("-created_at"))
            print(f"Lenient query found {len(artworks)} artworks")
        
        # Cache for 5 minutes
        set_cache_data(cache_key, artworks, 300)
        
        return artworks
        
    except Exception as e:
        print(f"Error in get_artworks_for_sale: {e}")
        # Return empty list on error to prevent crashes
        return []
