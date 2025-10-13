from bson import ObjectId
from rest_framework import generics, permissions
from api.models.artwork_model.artwork import Art
from api.models.interaction_model.hidden_content import HiddenContent
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
from mongoengine.queryset.visitor import Q
from rest_framework.exceptions import NotFound
import os
from django.conf import settings
import cloudinary.uploader
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
class UpdateArtworkView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        try:
            art = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        if str(art.artist.id) != str(request.user.id):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # ----- MAIN IMAGE -----
        main_image = request.FILES.get("main_image")
        if main_image:
            upload_result = cloudinary.uploader.upload(main_image)
            main_url = upload_result.get("secure_url")
            if art.image_url and len(art.image_url) > 0:
                art.image_url[0] = main_url
            else:
                # Initialize as list if None/empty
                if not art.image_url:
                    art.image_url = []
                art.image_url.append(main_url)  # Add as first image if empty

        # ----- ADDITIONAL IMAGES -----
        additional_images = request.FILES.getlist("additional_images")
        # Ensure image_url is initialized as a list
        if not art.image_url:
            art.image_url = []

        for img_file in additional_images:
            upload_result = cloudinary.uploader.upload(img_file)
            img_url = upload_result.get("secure_url")
            art.image_url.append(img_url)

        # ----- ENSURE IMAGE_URL IS ALWAYS A LIST -----
        if not art.image_url or not isinstance(art.image_url, (list, tuple)):
            art.image_url = []
        
        # ----- SERIALIZER UPDATE FOR OTHER FIELDS -----
        serializer = ArtSerializer(art, data=request.data, partial=True)
        if serializer.is_valid():
            updated_art = serializer.save()
            return Response(ArtSerializer(updated_art).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteArtworkImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, image_index):
        try:
            art = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        if str(art.artist.id) != str(request.user.id):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        if image_index < 0 or image_index >= len(art.image_url):
            return Response({"error": "Invalid image index"}, status=status.HTTP_400_BAD_REQUEST)

     
        art.image_url.pop(image_index)
        art.save()

        return Response({"message": "Image deleted from database"}, status=status.HTTP_200_OK)


class ArtListView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        blocked_user_ids = []
        if self.request.user.is_authenticated and hasattr(self.request.user, 'blocked_users'):
            blocked_user_ids = [user.id for user in self.request.user.blocked_users]

        artworks = Art.objects(
            visibility__iexact="public",
            art_status__iexact="active",
            artist__nin=blocked_user_ids
        ).order_by('-created_at')

        # Filter out hidden artworks for the current user
        if self.request.user.is_authenticated:
            try:
                user = User.objects.get(id=ObjectId(self.request.user.id))
                hidden_contents = HiddenContent.objects.filter(user=user, content_type='artwork')
                if hidden_contents:
                    hidden_artwork_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                    artworks = artworks.filter(id__nin=hidden_artwork_ids)
            except Exception as e:
                # If there's an error getting hidden artworks, just continue without filtering
                pass

        return artworks


class PopularLightweightArtView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        try:
            blocked_user_ids = []
            if request.user.is_authenticated and hasattr(request.user, 'blocked_users'):
                blocked_user_ids = [user.id for user in request.user.blocked_users]

            # Get deactivated and scheduled for deletion user IDs to exclude their content
            deactivated_user_ids = User.objects(user_status__iexact="deactivated").scalar('id')
            scheduled_deletion_user_ids = User.objects(user_status__iexact="scheduled_for_deletion").scalar('id')
            
            # Combine blocked, deactivated, and scheduled deletion user IDs
            all_excluded_ids = list(blocked_user_ids) + list(deactivated_user_ids) + list(scheduled_deletion_user_ids)
            
            artworks = Art.objects(
                visibility__iexact="public",
                art_status__iexact="active",
                artist__nin=all_excluded_ids
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

            query = Q(visibility__iexact="public") & Q(artist__nin=blocked_user_ids) & (
                Q(art_status__iexact="onSale") |
                (Q(edition__iexact="Open Edition") & Q(quantity__gt=0))
            )

            artworks = Art.objects(query).order_by("-created_at")

            # Filter out hidden artworks for the current user
            if request.user.is_authenticated:
                try:
                    user = User.objects.get(id=ObjectId(request.user.id))
                    hidden_artworks = HiddenArtwork.objects.filter(user=user)
                    if hidden_artworks:
                        hidden_artwork_ids = [ha.artwork.id for ha in hidden_artworks]
                        artworks = artworks.filter(id__nin=hidden_artwork_ids)
                except Exception as e:
                    # If there's an error getting hidden artworks, just continue without filtering
                    pass

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
                artist=user,
                art_status__in=["onSale", "on Sale", "Unlisted", "Sold"]  
            ).only(
                "title", "price", "discounted_price", "total_ratings",
                "image_url", "category", "visibility", "art_status", "artist"
            ).order_by("-created_at")

            serializer = ArtCardSerializer(artworks, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            print("Error fetching my art cards:", e)
            return Response({"error": str(e)}, status=500)



        
class UserArtCardListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, user_id):
        try:
            if request.user.is_authenticated and hasattr(request.user, 'blocked_users'):
                blocked_user_ids = [user.id for user in request.user.blocked_users]
                if str(user_id) in [str(uid) for uid in blocked_user_ids]:
                    return Response([], status=200)

            artworks = Art.objects(
                artist=user_id,
                visibility__iexact="public",
                art_status__in=["onSale", "on Sale"] 
            ).only(
                "title", "price", "discounted_price", "total_ratings",
                "image_url", "category", "visibility", "art_status"
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

        # Get deactivated user IDs to exclude their content
        deactivated_user_ids = User.objects(user_status__iexact="deactivated").scalar('id')
        
        # Combine blocked and deactivated user IDs
        all_excluded_ids = list(blocked_user_ids) + list(deactivated_user_ids)
        
        artworks = Art.objects(
            visibility__iexact="public",
            art_status__in=valid_statuses,
            artist__nin=all_excluded_ids
        ).order_by('-created_at')

        # Filter out hidden artworks for the current user
        if self.request.user.is_authenticated:
            try:
                user = User.objects.get(id=ObjectId(self.request.user.id))
                hidden_contents = HiddenContent.objects.filter(user=user, content_type='artwork')
                if hidden_contents:
                    hidden_artwork_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                    artworks = artworks.filter(id__nin=hidden_artwork_ids)
            except Exception as e:
                # If there's an error getting hidden artworks, just continue without filtering
                pass

        return artworks

   
    
class ArtListViewOwner(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.request.query_params.get('userId', None)
       
        valid_statuses = ["Active", "onBid", "Hidden", "Archived", "Deleted"]

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
            user = User.objects.get(id=ObjectId(request.user.id))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")
        except User.DoesNotExist:
            raise Http404("User not found")

        # Check if artwork is already hidden by this user
        existing_hidden = HiddenContent.objects.filter(
            user=user, 
            content_type='artwork', 
            content_id=str(artwork.id)
        ).first()
        
        if existing_hidden:
            return Response({"message": "Artwork was already hidden."}, status=status.HTTP_200_OK)
        
        # Create new hidden content record
        hidden_content = HiddenContent(
            user=user,
            content_type='artwork',
            content_id=str(artwork.id),
            hidden_at=datetime.utcnow()
        )
        hidden_content.save()

        return Response({"message": "Artwork hidden successfully."}, status=status.HTTP_200_OK)
    
class UnHideArtworkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
            user = User.objects.get(id=ObjectId(request.user.id))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")
        except User.DoesNotExist:
            raise Http404("User not found")

        # Remove the hidden content record for this user
        hidden_content = HiddenContent.objects.filter(
            user=user,
            content_type='artwork',
            content_id=str(artwork.id)
        ).first()

        if hidden_content:
            hidden_content.delete()
            return Response({"message": "Artwork unhidden successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Artwork was not hidden."}, status=status.HTTP_200_OK)
    
class DeleteArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only update the necessary fields without triggering full validation
        Art.objects(id=ObjectId(pk)).update_one(
            set__art_status="Active",
            set__visibility="Deleted",
            set__updated_at=datetime.utcnow()
        )

        return Response({"message": "Artwork deleted successfully."}, status=status.HTTP_200_OK)


class RestoreArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure image_url is always a list
        if isinstance(artwork.image_url, str):
            artwork.image_url = [artwork.image_url]
        elif not isinstance(artwork.image_url, (list, tuple)):
            artwork.image_url = []

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

        # ✅ normalize image_url if it's not a list
        if artwork.image_url and not isinstance(artwork.image_url, (list, tuple)):
            artwork.image_url = [artwork.image_url]

        artwork.art_status = "Active"
        artwork.visibility = "Archived"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response(
            {"message": "Artwork Archived successfully."},
            status=status.HTTP_200_OK
        )


class UnArchivedArtwork(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        # Ensure image_url is always a list
        if not artwork.image_url or not isinstance(artwork.image_url, (list, tuple)):
            artwork.image_url = []
            
        artwork.art_status = "Active"
        artwork.visibility = "Public"
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response({"message": "Artwork unarchived successfully."}, status=status.HTTP_200_OK)
    
class UpdateArtworkVisibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            artwork = Art.objects.get(id=ObjectId(pk))
        except Art.DoesNotExist:
            raise Http404("Artwork not found")

        new_visibility = request.data.get("visibility")

        if new_visibility not in ["Public", "Private"]:
            return Response(
                {"message": "Invalid visibility. Only 'Public' or 'Private' are allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure image_url is always a list
        if not artwork.image_url or not isinstance(artwork.image_url, (list, tuple)):
            artwork.image_url = []

        artwork.visibility = new_visibility
        artwork.updated_at = datetime.utcnow()
        artwork.save()

        return Response(
            {"message": f"Artwork visibility updated to {new_visibility}.", "visibility": new_visibility},
            status=status.HTTP_200_OK,
        )

class BulkUnhideArtworksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            user = User.objects.get(id=ObjectId(request.user.id))
        except User.DoesNotExist:
            raise Http404("User not found")

        # Remove all hidden content records for this user
        hidden_contents = HiddenContent.objects.filter(
            user=user,
            content_type='artwork'
        )
        
        count = hidden_contents.count()
        hidden_contents.delete()

        return Response(
            {"message": f"Successfully unhid {count} artworks.", "count": count},
            status=status.HTTP_200_OK,
        )

class UserArtworksWithHiddenView(generics.ListAPIView):
    serializer_class = ArtSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.request.query_params.get('userId', None)
        visibility_filter = self.request.query_params.get('visibility', None)
        
        
        if not user_id:
            return Art.objects.none()
            
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except User.DoesNotExist:
            return Art.objects.none()

        # Base query for user's artworks
        artworks = Art.objects.filter(artist=user).order_by('-created_at')

        # Handle different visibility filters
        if visibility_filter:
            if visibility_filter.lower() == 'hidden':
                # Return ALL artworks that are hidden by the current user (regardless of owner)
                if self.request.user.is_authenticated:
                    try:
                        current_user = User.objects.get(id=ObjectId(self.request.user.id))
                        
                        hidden_contents = HiddenContent.objects.filter(
                            user=current_user, 
                            content_type='artwork'
                        )
                        
                        if hidden_contents:
                            hidden_artwork_ids = []
                            for hc in hidden_contents:
                                try:
                                    artwork_id = ObjectId(hc.content_id)
                                    hidden_artwork_ids.append(artwork_id)
                                except Exception as e:
                                    print(f"DEBUG: Failed to convert content_id {hc.content_id} to ObjectId: {e}")
                            
                            # Get ALL artworks that are hidden by current user (not just profile owner's artworks)
                            artworks = Art.objects.filter(id__in=hidden_artwork_ids).order_by('-created_at')
                            
                        else:
                            # No hidden artworks
                            return Art.objects.none()
                    except Exception as e:
                        print(f"Error in hidden filter: {e}")
                        return Art.objects.none()
                else:
                    return Art.objects.none()
                    
            elif visibility_filter.lower() == 'public':
                # Return public artworks that are not hidden by current user
                artworks = artworks.filter(visibility__iexact='public')
                if self.request.user.is_authenticated:
                    try:
                        current_user = User.objects.get(id=ObjectId(self.request.user.id))
                        hidden_contents = HiddenContent.objects.filter(
                            user=current_user, 
                            content_type='artwork'
                        )
                        if hidden_contents:
                            hidden_artwork_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                            artworks = artworks.filter(id__nin=hidden_artwork_ids)
                    except Exception:
                        pass
                        
            elif visibility_filter.lower() == 'private':
                artworks = artworks.filter(visibility__iexact='private')
                
            elif visibility_filter.lower() == 'archived':
                artworks = artworks.filter(visibility__iexact='archived')
                
            elif visibility_filter.lower() == 'deleted':
                artworks = artworks.filter(visibility__iexact='deleted')

        return artworks