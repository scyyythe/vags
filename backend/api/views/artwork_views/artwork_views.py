from bson import ObjectId
from rest_framework import generics, permissions
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from datetime import datetime


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
    queryset = Art.objects.all().order_by('-created_at')
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request, *args, **kwargs):
        # This ensures the query retrieves the artworks in the order you want
        response = super().get(request, *args, **kwargs)
        response['Cache-Control'] = 'no-store'  # Prevent caching
        return response



class ArtDetailView(generics.RetrieveAPIView):
    queryset = Art.objects.all()
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]



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
