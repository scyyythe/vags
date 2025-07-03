from bson import ObjectId
from rest_framework import generics, permissions
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.serializers.artwork_s.artwork_serializers import ArtCardSerializer
from api.serializers.artwork_s.artwork_serializers import LightweightArtSerializer
from api.serializers.artwork_s.artwork_detail_serializer import ArtDetailSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from api.models.interaction_model.interaction import Like
from datetime import datetime
from rest_framework.response import Response
from django.http import Http404
from rest_framework.views import APIView
from rest_framework import status
from django.utils.timesince import timesince
from django.core.exceptions import ValidationError
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

class ArtCreateView(generics.ListCreateAPIView):
    queryset = Art.objects.all()
    serializer_class = ArtSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            mongo_user = User.objects.get(id=ObjectId(self.request.user.id))
        except Exception as e:
            print("❌ Error retrieving MongoEngine user:", e)
            raise PermissionDenied("Invalid user.")

        if mongo_user.is_suspended:
            suspension = mongo_user.get_active_suspension()
            raise PermissionDenied(
                detail=f"Your account is suspended until {suspension.end_date.strftime('%B %d, %Y at %I:%M %p')}. Reason: {suspension.reason}"
            )

        try:
            art = serializer.save(artist=mongo_user)
            print("✅ Art saved:", art.id)
        except Exception as e:
            print("❌ Error during serializer.save():", e)
            raise ValidationError({"error": str(e)})


class SellArtworkView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  

    def post(self, request):
        try:
            mongo_user = User.objects.get(id=ObjectId(request.user.id))
        except Exception as e:
            print("Error retrieving MongoEngine user:", e)
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if mongo_user.is_suspended:
            suspension = mongo_user.get_active_suspension()
            return Response({
                "error": f"Account suspended until {suspension.end_date.strftime('%B %d, %Y at %I:%M %p')}. Reason: {suspension.reason}"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ArtSerializer(data=request.data)
        if serializer.is_valid():
            art = serializer.save(artist=mongo_user)
            return Response(ArtSerializer(art).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ArtListView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        blocked_user_ids = []
        if self.request.user.is_authenticated and hasattr(self.request.user, 'blocked_users'):
            blocked_user_ids = [user.id for user in self.request.user.blocked_users]

        return Art.objects(
            visibility__iexact="public",
            art_status__iexact="active",
            artist__nin=blocked_user_ids
        ).order_by('-created_at')


class PopularLightweightArtView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        try:
            blocked_user_ids = []
            if request.user.is_authenticated and hasattr(request.user, 'blocked_users'):
                blocked_user_ids = [user.id for user in request.user.blocked_users]

 
            artworks = Art.objects(
                visibility__iexact="public",
                art_status__iexact="active",
                artist__nin=blocked_user_ids
            )
 
            artworks = [art for art in artworks if art.image_url and len(art.image_url) > 0]
     
            artworks_sorted = sorted(
                artworks,
                key=lambda art: Like.objects.filter(art=art).count(),
                reverse=True
            )

            top_artworks = artworks_sorted[:5] if artworks_sorted else artworks[:5]

            serializer = LightweightArtSerializer(top_artworks, many=True)
            return Response(serializer.data)

        except Exception as e:
        
            return Response({"error": str(e)}, status=500)


class ArtCardListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        try:
            blocked_user_ids = []
            if request.user.is_authenticated and hasattr(request.user, 'blocked_users'):
                blocked_user_ids = [user.id for user in request.user.blocked_users]

            artworks = Art.objects(
                visibility__iexact="public",
                art_status__iexact="onSale", 
                artist__nin=blocked_user_ids
            ).only("title", "price", "discounted_price", "total_ratings", "image_url", "category","edition").order_by("-created_at")

            serializer = ArtCardSerializer(artworks, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class MyArtCardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            artworks = Art.objects(
                artist=user.id,
                art_status__iexact="onSale",
                visibility__iexact="public"
            ).only(
                "title", "price", "discounted_price", "total_ratings", "image_url", "category", "visibility", "art_status"
            ).order_by("-created_at")

            serializer = ArtCardSerializer(artworks, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ArtBulkListView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        valid_statuses = ["Active"]
        blocked_user_ids = []
        if self.request.user.is_authenticated and hasattr(self.request.user, 'blocked_users'):
            blocked_user_ids = [user.id for user in self.request.user.blocked_users]

        return Art.objects(
            visibility__iexact="public",
            art_status__in=valid_statuses,
            artist__nin=blocked_user_ids
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


class MarketplaceArtDetailView(generics.RetrieveAPIView):
    serializer_class = ArtDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self):
        art_id = self.kwargs.get('pk')
        try:
            return Art.objects.get(id=art_id, art_status="For Sale", visibility="Public")
        except Art.DoesNotExist:
            raise NotFound("Artwork not found or not available for sale.")


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

        artwork.visibility = "Public"
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