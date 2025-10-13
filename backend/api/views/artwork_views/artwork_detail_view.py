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
            art_obj_id = ObjectId(art_id)
        except Exception:
            raise NotFound("Invalid artwork ID.")

        try:
         
            art = Art.objects.get(id=art_obj_id)

          
            if art.visibility.lower() != "public":
                raise NotFound("Artwork not public.")

            # Check if the artist is deactivated
            from api.models.user_model.users import User
            if art.artist:
                try:
                    artist = User.objects.get(id=art.artist)
                    if artist.user_status and artist.user_status.lower() == "deactivated":
                        raise NotFound("Artwork not available.")
                except User.DoesNotExist:
                    raise NotFound("Artist not found.")

            return art

        except Art.DoesNotExist:
            raise NotFound("Artwork not found.")
        except Exception as e:
            traceback.print_exc()
            raise NotFound("Something went wrong loading artwork.")

