
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.models.artwork_model.wishlist import Wishlist
from api.models.artwork_model.artwork import Art

class ToggleWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, art_id):
        user = request.user

        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item = Wishlist.objects(user=user, art=art).first()

        if wishlist_item:
            wishlist_item.delete()
            return Response({"message": "Removed from wishlist."}, status=status.HTTP_200_OK)
        else:
            Wishlist.objects.create(user=user, art=art)
            return Response({"message": "Added to wishlist."}, status=status.HTTP_201_CREATED)
