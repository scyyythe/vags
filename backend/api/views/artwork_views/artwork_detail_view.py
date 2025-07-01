from bson import ObjectId
from bson.errors import InvalidId
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.artwork_detail_serializer import ArtDetailSerializer

class MarketplaceArtDetailView(generics.RetrieveAPIView):
    serializer_class = ArtDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        art_id = self.kwargs.get("pk")

        if not ObjectId.is_valid(art_id):
      
            raise NotFound("Invalid artwork ID.")

        try:
         
            art = Art.objects.get(
                id=ObjectId(art_id),
                art_status="For Sale",
                visibility="Public"
            )
        
            return art
        except Art.DoesNotExist:
        
            raise NotFound("Artwork not found or not available for sale.")
