from bson import ObjectId
from bson.errors import InvalidId
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.artwork_detail_serializer import ArtDetailSerializer
import traceback
from mongoengine.queryset.visitor import Q

class MarketplaceArtDetailView(generics.RetrieveAPIView):
    serializer_class = ArtDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        art_id = self.kwargs.get("pk")
       

        try:
            art = Art.objects.get(
                Q(id=art_id) &
                Q(visibility__iexact="Public") &
                (
                    Q(art_status__iexact="onSale") |
                    Q(edition__iexact="Open Edition", quantity__gt=0)
                )
            )
         
            return art
        except Art.DoesNotExist:
        
            raise NotFound("Artwork not found or not available for sale.")
        except Exception as e:
        
            traceback.print_exc()
            raise NotFound("Something went wrong loading artwork.")
