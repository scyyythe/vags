from bson import ObjectId
from rest_framework import generics, permissions
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from datetime import datetime
from rest_framework.response import Response
from django.http import Http404
from rest_framework.views import APIView
from rest_framework import status
from django.utils.timesince import timesince
from django.core.exceptions import ValidationError
from django.db.models import Q

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
        now = datetime.now()
        time_elapsed = timesince(art.created_at, now)


class ArtListView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Art.objects(
            visibility__iexact="public",
            art_status__iexact="active"
        ).order_by('-created_at')

class ArtBulkListView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        valid_statuses = ["Active", "onBid"]
        return Art.objects.filter(
            visibility__iexact="public",
            art_status__in=valid_statuses
        ).order_by('-created_at')
   
    
class ArtListViewOwner(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.request.query_params.get('userId', None)
        valid_statuses = ["Active", "onBid", "Hidden"]

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                return Art.objects.filter(
                    artist=user,
                    art_status__in=valid_statuses
                ).order_by('-created_at')
            except User.DoesNotExist:
                raise ValidationError("User not found.")
        else:
            return Art.objects.filter(
                artist=self.request.user,
                art_status__in=valid_statuses
            ).order_by('-created_at')


class ArtListViewSpecificUser(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.request.query_params.get('userId', None)
        print(f"Received userId: {user_id}")
        valid_statuses = ["Active", "onBid", "Hidden"]

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                return Art.objects.filter(
                    artist=user,
                    art_status__in=valid_statuses
                ).order_by('-created_at')
            except User.DoesNotExist:
                raise ValidationError("User not found.")
        else:
            return Art.objects.filter(
                art_status__in=valid_statuses
            ).order_by('-created_at')



    
class ArtworksByArtistView(generics.RetrieveAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        artist_id = self.kwargs.get('artist_id')
        artworks = Art.objects.filter(artist_id=artist_id)

        if not artworks:
            raise Http404("No artworks found for this artist")

        return artworks
    
class ArtDetailView(generics.RetrieveAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
    
        art_id = self.kwargs.get('pk')
        try:
            return Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

class BulkArtDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, *args, **kwargs):
        ids = request.query_params.getlist('ids')

        
        if len(ids) == 1 and ',' in ids[0]:
            ids = ids[0].split(',')

        
        try:
            object_ids = [ObjectId(id) for id in ids]
        except Exception:
            return Response({"error": "One or more IDs are not valid ObjectId values."}, status=400)

        artworks = Art.objects.filter(id__in=object_ids)
        serializer = ArtSerializer(artworks, many=True)
        return Response(serializer.data)

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


class HideArtworkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.visibility = "Hidden"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork hidden successfully."}, status=status.HTTP_200_OK)
    
class UnHideArtworkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.visibility = "Active"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork unhidden successfully."}, status=status.HTTP_200_OK)
    
class DeleteArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.art_status = "Active"
        artwork.visibility = "Deleted"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork deleted successfully."}, status=status.HTTP_200_OK)

class RestoreArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.art_status = "Active"
        artwork.visibility = "Public"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork restored successfully."}, status=status.HTTP_200_OK)
    
class DeletePermanentArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk)) 
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.delete()  

        return Response({"message": "Artwork permanently deleted."}, status=status.HTTP_200_OK)

    
class ArchivedArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.art_status = "Active"
        artwork.visibility = "Archived"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork Archived successfully."}, status=status.HTTP_200_OK)

class UnArchivedArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        artwork.art_status = "Active"
        artwork.visibility = "Public"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork unarchived successfully."}, status=status.HTTP_200_OK)