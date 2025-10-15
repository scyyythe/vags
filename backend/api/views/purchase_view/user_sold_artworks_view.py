from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from api.models.purchase_model.order import PurchasedArtwork
from api.models.artwork_model.artwork import Art
from bson import ObjectId
from rest_framework import status
from api.models.review_model.review import Review 

class UserSoldArtworksView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, user_id):
        status_filter = request.query_params.get("status")

        try:
            # Convert user_id to ObjectId
            user_object_id = ObjectId(user_id)
        except:
            return Response({"error": "Invalid user ID"}, status=status.HTTP_400_BAD_REQUEST)

        # Get user's artwork IDs
        user_artworks = Art.objects(artist=user_object_id).only("id")
        user_artwork_ids = [art.id for art in user_artworks]

        if not user_artwork_ids:
            return Response([])

        # Build optimized query with proper field selection for MongoDB
        queryset = PurchasedArtwork.objects(artwork__in=user_artwork_ids).only(
            'id', 'artwork', 'buyer', 'shipping_address', 'payment_method', 'is_paid',
            'quantity', 'total_price', 'status', 'created_at', 'updated_at'
        )

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        sales = queryset.order_by("-created_at")
        
        # Get all purchase IDs for batch review lookup
        purchase_ids = [str(sale.id) for sale in sales]
        
        # Pre-fetch all reviews for these purchases
        reviews_data = {}
        if purchase_ids:
            reviews = Review.objects(purchase__in=purchase_ids).only(
                'purchase', 'rating', 'comment', 'photos', 'created_at'
            )
            for review in reviews:
                purchase_id = str(review.purchase)
                if purchase_id not in reviews_data:
                    reviews_data[purchase_id] = []
                reviews_data[purchase_id].append({
                    "id": str(review.id),
                    "rating": review.rating,
                    "comment": review.comment,
                    "photos": review.photos,
                    "created_at": review.created_at,
                })

        # Build optimized result without pagination
        result = []
        for sale in sales:
            artwork = sale.artwork
            sale_id = str(sale.id)
            
            # Get review data for this sale
            review_data = reviews_data.get(sale_id)
            if review_data:
                # Add buyer info to the first review
                review_data[0]["buyer_id"] = str(sale.buyer.id)
                review_data[0]["buyer_name"] = f"{sale.buyer.first_name} {sale.buyer.last_name}"
                review_data = review_data[0]  # Take the first review

            result.append({
                "id": sale_id,
                "artwork_id": str(artwork.id),
                "artwork_title": artwork.title,
                "artwork_image": artwork.image_url[0] if artwork.image_url else "",
                "artist_id": str(artwork.artist.id),
                "price": sale.total_price,
                "quantity": sale.quantity,
                "payment_method": sale.payment_method,
                "is_paid": sale.is_paid,
                "status": sale.status,
                "buyer_id": str(sale.buyer.id),
                "buyer_name": f"{sale.buyer.first_name} {sale.buyer.last_name}",
                "shipping_address": sale.shipping_address.to_mongo() if sale.shipping_address else {},
                "created_at": sale.created_at,
                "updated_at": sale.updated_at,
                "artwork_size": artwork.size or "",
                "artwork_medium": artwork.medium or "",
                "artwork_style": artwork.category or "",
                "artwork_edition": artwork.edition or "",
                "artwork_year_created": artwork.year_created,
                "review": review_data,
            })

        return Response(result)
