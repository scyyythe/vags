from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models.purchase_model.order import PurchasedArtwork
from api.models.artwork_model.artwork import Art
from bson import ObjectId
from rest_framework import status
class MySoldArtworksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
       
        status_filter = request.query_params.get("status")

      
        my_artworks = Art.objects(artist=request.user).only("id")
        my_artwork_ids = [art.id for art in my_artworks]

     
        queryset = PurchasedArtwork.objects(artwork__in=my_artwork_ids)

      
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        queryset = queryset.order_by("-created_at")

      
        result = []
        for sale in queryset:
            artwork = sale.artwork
            result.append({
                "id": str(sale.id),
                "artwork_id": str(artwork.id),
                "artwork_title": artwork.title,
                "artwork_image": artwork.image_url[0] if artwork.image_url else "",
                "price": sale.total_price,
                "quantity": sale.quantity,
                "payment_method": sale.payment_method,
                "is_paid": sale.is_paid,
                "status": sale.status,
                "buyer_name": f"{sale.buyer.first_name} {sale.buyer.last_name}",
                "shipping_address": sale.shipping_address.to_mongo(),
                "created_at": sale.created_at,
                "updated_at": sale.updated_at,

                
                "artwork_size": artwork.size or "",
                "artwork_medium": artwork.medium or "",
                "artwork_style": artwork.category or "",
                "artwork_edition": artwork.edition or "",
                "artwork_year_created": artwork.year_created,
            })


        return Response(result)

class ToggleArtworkStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, artwork_id):
        try:
            artwork = Art.objects.get(id=ObjectId(artwork_id), artist=request.user)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

     
        if artwork.art_status == "Sold":
            artwork.art_status = "onSale" 
            message = "Artwork is now on sale"
        else:
            artwork.art_status = "Sold"
            message = "Artwork marked as sold"

        artwork.save()

        return Response(
            {"message": message, "artwork_id": str(artwork.id), "new_status": artwork.art_status},
            status=status.HTTP_200_OK
        )
    
class MarkArtworkAsUnlistedView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, artwork_id):
        try:
            artwork = Art.objects.get(id=ObjectId(artwork_id), artist=request.user)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

      
        if artwork.art_status == "Unlisted":
            artwork.art_status = "onSale"
            message = "Artwork is now on sale"
        else:
            artwork.art_status = "Unlisted"
            message = "Artwork marked as unlisted"

        artwork.save()

        return Response(
            {"message": message, "artwork_id": str(artwork.id), "new_status": artwork.art_status},
            status=status.HTTP_200_OK
        )
