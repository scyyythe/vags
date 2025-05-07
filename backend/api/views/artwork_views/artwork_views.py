from bson import ObjectId
from rest_framework import generics, permissions
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from datetime import datetime
from django.core.cache import cache
from api.utils.cache_utils import get_cached_data, set_cache_data, delete_cache_data

class ArtCreateView(generics.ListCreateAPIView):
    queryset = Art.objects.all()
    serializer_class = ArtSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            mongo_user = User.objects.get(id=ObjectId(self.request.user.id))
        except Exception as e:
            print("Error retrieving MongoEngine user:", e)
            raise e

        art = serializer.save(artist=mongo_user)
        art = Art.objects.get(id=art.id)

        Notification(
            user=mongo_user,
            message=f"Your artwork '{art.title}' has been uploaded successfully.",
            art=art
        ).save()



class ArtListView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Art.objects.order_by('-created_at')
    
class ArtListViewOwner(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        
        user_id = self.request.user.id  
        return Art.objects.filter(artist__id=ObjectId(user_id)).order_by('-created_at')

class ArtDetailView(generics.RetrieveAPIView):
    queryset = Art.objects.all()
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ArtListByArtistView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        artist_id = self.kwargs.get("artist_id") 
        if artist_id:
            try:
                return Art.objects.filter(artist=ObjectId(artist_id)).order_by('-created_at')
            except Exception as e:
                print("Invalid artist ID:", e)
                return Art.objects.none()
        return Art.objects.none()


class ArtUpdateView(generics.UpdateAPIView):
    queryset = Art.objects.all()
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        art = serializer.save(updated_at=datetime.utcnow())


        Notification(
            user=art.artist,
            message=f"Your artwork '{art.title}' has been updated successfully.",
            art=art
        ).save()


class ArtDeleteView(generics.DestroyAPIView):
    queryset = Art.objects.all()
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        artist = instance.artist
        title = instance.title
        instance.delete()

     
        Notification(
            user=artist,
            message=f"Your artwork '{title}' has been deleted successfully."
        ).save()
