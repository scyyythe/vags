
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.models.artwork_model.wishlist import Wishlist
from api.models.artwork_model.artwork import Art
from bson import ObjectId
from api.serializers.artwork_s.artwork_serializers import ArtCardSerializer

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


class WishlistArtView(APIView):
    def post(self, request):
        ids = request.data.get("ids", [])

        if not isinstance(ids, list) or not all(isinstance(i, str) for i in ids):
            return Response({"error": "Invalid or missing 'ids' list"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            object_ids = [ObjectId(id) for id in ids]
            arts = Art.objects.filter(id__in=object_ids, visibility="Public")
            serializer = ArtCardSerializer(arts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("❌ Error fetching wishlist:", e)
            return Response({"error": "Failed to fetch wishlist artworks"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class WishlistIDListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
      
        wishlist_items = Wishlist.objects.filter(user=request.user, art__visibility="Public").select_related("art")
        artworks = [item.art for item in wishlist_items]
        serializer = ArtSerializer(artworks, many=True)

        return Response(serializer.data)


class MyWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        wishlist_items = Wishlist.objects(user=user)
        art_ids = [item.art.id for item in wishlist_items if item.art is not None]
        arts = Art.objects(id__in=art_ids)
        serializer = ArtCardSerializer(arts, many=True)
        return Response(serializer.data)

    def delete(self, request):
        user = request.user
        art_id = request.data.get("art_id")
        if not art_id:
            return Response({"detail": "art_id is required"}, status=400)

        Wishlist.objects(user=user, art=art_id).delete()
        return Response({"detail": "Removed from wishlist"})
