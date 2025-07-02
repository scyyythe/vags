from bson import ObjectId
from bson.errors import InvalidId
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.artwork_detail_serializer import ArtDetailSerializer
import traceback

class MarketplaceArtDetailView(generics.RetrieveAPIView):
    serializer_class = ArtDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        art_id = self.kwargs.get("pk")
        print("🟢 Received ID:", art_id)

        try:
            art = Art.objects.get(
                id=art_id,
                art_status="onSale",
                visibility="Public"
            )
            print("🟢 Art object found:", art.title)

            return art
        except Art.DoesNotExist:
            print("❌ Artwork not found with filters.")
            raise NotFound("Artwork not found or not available for sale.")
        except Exception as e:
            print("🔥 Unexpected error:", e)
            traceback.print_exc()
            raise NotFound("Something went wrong loading artwork.")
