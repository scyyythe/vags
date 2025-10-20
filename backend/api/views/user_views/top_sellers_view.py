
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.purchase_model.order import PurchasedArtwork
from api.models.review_model.review import Review
from rest_framework.permissions import AllowAny
from api.models.interaction_model.follows import Follower
from django.core.cache import cache
import hashlib
class TopSellersAPIView(APIView):
    permission_classes = [AllowAny] 
    def get(self, request):
        users = User.objects(role="User", user_status="Active")
        seller_data = []

        for user in users:
            user_artworks = Art.objects(artist=user)
            on_sale_count = user_artworks.filter(art_status__iexact="onSale").count()

            sold_artworks = PurchasedArtwork.objects(
                artwork__in=user_artworks, status="Completed"
            )
            sold_count = sold_artworks.count()

            reviews = Review.objects(artwork__in=user_artworks)
            avg_rating = (
                sum([r.rating for r in reviews]) / reviews.count()
                if reviews.count() > 0 else 0
            )

            # Include only users who have BOTH sales AND reviews
            if sold_count > 0 and reviews.count() > 0:
                seller_data.append({
                    "id": str(user.id),
                    "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                    "profile_picture": getattr(user, "profile_picture", ""),
                    "rating": round(avg_rating, 2),
                    "art_count": on_sale_count,
                    "sold_count": sold_count,
                    "review_count": reviews.count(),
                })

        sorted_sellers = sorted(
            seller_data,
            key=lambda x: (x["sold_count"], x["review_count"], x["rating"]),
            reverse=True
        )

        # Debug: Count users with different criteria
        users_with_sales = sum(1 for s in seller_data if s["sold_count"] > 0)
        users_with_reviews = sum(1 for s in seller_data if s["review_count"] > 0)
        users_with_both = sum(1 for s in seller_data if s["sold_count"] > 0 and s["review_count"] > 0)
        
        print(f"TopSellers: {len(seller_data)} users with BOTH sales AND reviews, {users_with_sales} with sales, {users_with_reviews} with reviews")
        
        return Response(sorted_sellers[:10], status=status.HTTP_200_OK)

class TopArtworksAPIView(APIView):
    def get(self, request):
        try:
            # Get query parameters for filtering
            category = request.GET.get('category', None)
            medium = request.GET.get('medium', None)
            time_range = request.GET.get('time_range', '7d')  # 7d, 30d, all
            
            # Create cache key based on parameters
            cache_key = f"top_artworks_{category}_{medium}_{time_range}"
            cache_key = hashlib.md5(cache_key.encode()).hexdigest()
            
            # Try to get from cache first (5 minute cache)
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return Response(cached_result, status=status.HTTP_200_OK)
            
            now = datetime.utcnow()

            # Time ranges based on filter
            if time_range == '7d':
                last_24h = now - timedelta(hours=24)
                prev_24h = last_24h - timedelta(hours=24)
                last_7d = now - timedelta(days=7)
                prev_7d = last_7d - timedelta(days=7)
            elif time_range == '30d':
                last_24h = now - timedelta(hours=24)
                prev_24h = last_24h - timedelta(hours=24)
                last_7d = now - timedelta(days=30)
                prev_7d = last_7d - timedelta(days=30)
            else:  # all time
                last_24h = now - timedelta(hours=24)
                prev_24h = last_24h - timedelta(hours=24)
                last_7d = datetime.min  # Start from beginning
                prev_7d = datetime.min

            # Build base query with filters - LIMIT to only artworks with sales
            base_query = {'art_status__iexact': 'onSale'}
            
            if category and category != 'All':
                base_query['category__iexact'] = category
                
            if medium and medium != 'Medium':
                base_query['medium__iexact'] = medium

            # Get all artworks with the base filters first (limit to reasonable number)
            artworks = Art.objects(**base_query).limit(500)
            
            # If no artworks match the filters, return empty
            if not artworks:
                return Response([], status=status.HTTP_200_OK)
            
            # Get all completed purchases
            all_purchases = PurchasedArtwork.objects(status="Completed")
            
            print(f"Found {len(artworks)} artworks and {len(all_purchases)} purchases")
        
            # Group purchases by artwork for faster lookup
            purchases_by_artwork = {}
            for purchase in all_purchases:
                art_id = str(purchase.artwork.id)
                if art_id not in purchases_by_artwork:
                    purchases_by_artwork[art_id] = []
                purchases_by_artwork[art_id].append(purchase)
            
            # Debug: Count artworks with sales
            artworks_with_sales = 0
            for art in artworks:
                art_id = str(art.id)
                sold_artworks = purchases_by_artwork.get(art_id, [])
                if len(sold_artworks) > 0:
                    artworks_with_sales += 1
            print(f"Artworks with sales: {artworks_with_sales}")

            # OPTIMIZATION 4: Pre-calculate artist editions in one query
            artist_ids = list(set([art.artist.id for art in artworks]))
            artist_editions = {}
            
            for artist_id in artist_ids:
                artist_artworks = Art.objects(artist=artist_id)
                editions_count = 0
                for a in artist_artworks:
                    if a.edition:
                        try:
                            editions_count += int(a.edition)
                        except (ValueError, TypeError):
                            editions_count += 1
                    else:
                        editions_count += 1
                artist_editions[artist_id] = editions_count

            artwork_data = []

            for art in artworks:
                art_id = str(art.id)
                sold_artworks = purchases_by_artwork.get(art_id, [])
                sold_count = len(sold_artworks)

                # Skip artworks with no sales
                if sold_count == 0:
                    continue

                # --- sales trends (optimized with pre-filtered data) ---
                sales_last_24h = sum(1 for p in sold_artworks if p.created_at >= last_24h)
                sales_prev_24h = sum(1 for p in sold_artworks if prev_24h <= p.created_at < last_24h)
                sales_last_7d = sum(1 for p in sold_artworks if p.created_at >= last_7d)
                sales_prev_7d = sum(1 for p in sold_artworks if prev_7d <= p.created_at < last_7d)

                def pct_change(current, prev):
                    if prev == 0 and current == 0:
                        return 0
                    elif prev == 0:
                        return 100
                    return round(((current - prev) / prev) * 100, 2)

                change24h = pct_change(sales_last_24h, sales_prev_24h)
                change7d = pct_change(sales_last_7d, sales_prev_7d)

                # Get unique buyers
                buyers = set(p.buyer.id for p in sold_artworks)

                # Get pre-calculated editions count
                editions_count = artist_editions.get(art.artist.id, 1)

                artwork_data.append({
                    "id": art_id,
                    "title": art.title,
                    "artist_name": f"{art.artist.first_name or ''} {art.artist.last_name or ''}".strip() or art.artist.username,
                    "profile_picture": getattr(art.artist, "profile_picture", ""),
                    "image_url": art.image_url[0] if art.image_url else None,
                    "starting_price": art.price,
                    "buyers": len(buyers),
                    "edition": editions_count,
                    "sold_count": sold_count,
                    "change24h": f"{'+' if change24h >= 0 else ''}{change24h}%",
                    "change7d": f"{'+' if change7d >= 0 else ''}{change7d}%",
                    "category": getattr(art, "category", None),
                    "medium": getattr(art, "medium", None),
                })

            # Sort by sold_count and return top 10
            sorted_artworks = sorted(
                artwork_data,
                key=lambda x: x["sold_count"],
                reverse=True
            )

            # Show up to 10 artworks, or all available if less than 10
            result = sorted_artworks[:10]
            
            print(f"Final result: {len(result)} artworks")
            for i, artwork in enumerate(result):
                print(f"{i+1}. {artwork['title']} - Sales: {artwork['sold_count']}")
            
            # If we have less than 10, log it for debugging
            if len(result) < 10:
                print(f"Warning: Only {len(result)} artworks with sales found. Total artworks processed: {len(artwork_data)}")
            
            # Cache the result for 5 minutes
            cache.set(cache_key, result, 300)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in TopArtworksAPIView: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PopularArtistsAPIView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request):
        artists = User.objects(role="User", user_status="Active")

        artist_data = []
        for artist in artists:
          
            followers_count = Follower.objects(following=artist).count()


            artworks_count = Art.objects(artist=artist).count()
            reviews_count = Review.objects(artist=artist).count() if hasattr(Review, "artist") else 0

            artist_data.append({
                "id": str(artist.id),
                "name": f"{artist.first_name or ''} {artist.last_name or ''}".strip() or artist.username,
                "profile_picture": getattr(artist, "profile_picture", ""),
                "followers": followers_count,
                "artworks_count": artworks_count,
                "reviews_count": reviews_count,
            })

        sorted_artists = sorted(
            artist_data,
            key=lambda x: (x["followers"], x["reviews_count"]),
            reverse=True,
        )

        return Response(sorted_artists[:12], status=status.HTTP_200_OK)
