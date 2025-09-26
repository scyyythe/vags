
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

            if on_sale_count > 0 or sold_count > 0:
                seller_data.append({
                    "id": str(user.id),
                    "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                    "profile_picture": getattr(user, "profile_picture", ""),
                    "rating": round(avg_rating, 2),
                    "art_count": on_sale_count,
                    "sold_count": sold_count,
                })

        sorted_sellers = sorted(
            seller_data,
            key=lambda x: (x["sold_count"], x["rating"]),
            reverse=True
        )

        return Response(sorted_sellers[:10], status=status.HTTP_200_OK)

class TopArtworksAPIView(APIView):
    def get(self, request):
        now = datetime.utcnow()

        # Time ranges
        last_24h = now - timedelta(hours=24)
        prev_24h = last_24h - timedelta(hours=24)

        last_7d = now - timedelta(days=7)
        prev_7d = last_7d - timedelta(days=7)

        artwork_data = []

        artworks = Art.objects(art_status__iexact="onSale")  # include active artworks
        for art in artworks:
            sold_artworks = PurchasedArtwork.objects(
                artwork=art, status="Completed"
            )
            sold_count = sold_artworks.count()

            # --- sales trends ---
            sales_last_24h = sold_artworks.filter(created_at__gte=last_24h).count()
            sales_prev_24h = sold_artworks.filter(
                created_at__gte=prev_24h, created_at__lt=last_24h
            ).count()

            sales_last_7d = sold_artworks.filter(created_at__gte=last_7d).count()
            sales_prev_7d = sold_artworks.filter(
                created_at__gte=prev_7d, created_at__lt=last_7d
            ).count()

            def pct_change(current, prev):
                if prev == 0 and current == 0:
                    return 0
                elif prev == 0:
                    return 100
                return round(((current - prev) / prev) * 100, 2)

            change24h = pct_change(sales_last_24h, sales_prev_24h)
            change7d = pct_change(sales_last_7d, sales_prev_7d)

            buyers = sold_artworks.distinct("buyer")

            # --- editions logic (sum all editions by artist) ---
            artist_artworks = Art.objects(artist=art.artist)
            editions_count = 0

            for a in artist_artworks:
                if a.edition:
                    try:
                        # if edition is numeric
                        editions_count += int(a.edition)
                    except (ValueError, TypeError):
                        # if edition is string like "Limited Edition", count as 1
                        editions_count += 1
                else:
                    editions_count += 1  # default 1 if not set

            artwork_data.append({
                "id": str(art.id),
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
            })

        sorted_artworks = sorted(
            artwork_data,
            key=lambda x: x["sold_count"],
            reverse=True
        )

        return Response(sorted_artworks[:10], status=status.HTTP_200_OK)

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
