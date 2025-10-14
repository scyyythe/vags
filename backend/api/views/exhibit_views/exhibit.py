from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,parsers
from api.serializers.exhibit_s.exhibit_seriliazers import ExhibitSerializer
from api.models.exhibit_model.exhibit import Exhibit
from api.models.interaction_model.hidden_content import HiddenContent
from api.serializers.exhibit_s.exhibit_card import ExhibitCardSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from datetime import datetime
from rest_framework import status
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from bson import ObjectId
from api.models.artwork_model.artwork import Art


class ExhibitCreateView(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        serializer = ExhibitSerializer(data=request.data)
        if serializer.is_valid():
            exhibit = serializer.save()
            return Response(ExhibitSerializer(exhibit).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ExhibitUpdateView(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def put(self, request, pk):
        try:
            exhibit = Exhibit.objects.get(id=pk)
        except Exhibit.DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExhibitSerializer(instance=exhibit, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            updated_exhibit = serializer.save()
            return Response(ExhibitSerializer(updated_exhibit, context={"request": request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExhibitListView(APIView):
    def get(self, request):
        exhibits = Exhibit.objects.all()
        serializer = ExhibitSerializer(exhibits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ExhibitCardListView(APIView):
    def get(self, request):
        try:
            # Optimized query: Get excluded user IDs in a single query
            excluded_user_ids = list(User.objects.filter(
                user_status__in=["deactivated", "scheduled_for_deletion"]
            ).scalar('id'))
            
            # Start with optimized base query
            exhibits = Exhibit.objects.filter(visibility='Public')
            
            # Apply user exclusion filter if needed
            if excluded_user_ids:
                exhibits = exhibits.filter(owner__nin=excluded_user_ids)
            
            # Optimize hidden content filtering
            if request.user.is_authenticated:
                try:
                    user = User.objects.get(id=ObjectId(request.user.id))
                    hidden_exhibit_ids = list(HiddenContent.objects.filter(
                        user=user, 
                        content_type='exhibit'
                    ).scalar('content_id'))
                    
                    if hidden_exhibit_ids:
                        # Convert string IDs to ObjectIds for filtering
                        hidden_object_ids = [ObjectId(hid) for hid in hidden_exhibit_ids]
                        exhibits = exhibits.filter(id__nin=hidden_object_ids)
                except Exception as e:
                    # Log error but continue without filtering
                    print(f"⚠️ Error filtering hidden exhibits: {e}")
                    pass
            
            # Order by creation date for consistent results
            exhibits = exhibits.order_by('-created_at')
            
            serializer = ExhibitCardSerializer(exhibits, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"🔥 ERROR in ExhibitCardListView: {e}")
            return Response({"error": "Failed to retrieve exhibits"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class MyExhibitCardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user  
            include_deleted = request.query_params.get("include_deleted", "false").lower() == "true"
            include_hidden = request.query_params.get("include_hidden", "false").lower() == "true"
            include_archived = request.query_params.get("include_archived", "false").lower() == "true"

            # Handle hidden exhibits using HiddenContent model
            if include_hidden:
                # When include_hidden=true, we want to show only hidden exhibits
                # Get all exhibits that this user has hidden, regardless of ownership
                try:
                    hidden_contents = HiddenContent.objects.filter(user=user, content_type='exhibit')
                    if hidden_contents:
                        hidden_exhibit_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                        exhibits = Exhibit.objects(id__in=hidden_exhibit_ids)
                        
                        # Filter based on visibility
                        if not include_deleted:
                            exhibits = exhibits.filter(visibility__ne="Deleted")
                        if not include_archived:
                            exhibits = exhibits.filter(visibility__ne="Archived")
                    else:
                        # No hidden exhibits found
                        exhibits = Exhibit.objects.none()
                except Exception as e:
                    # If there's an error getting hidden exhibits, return empty
                    print(f"🔥 DEBUG: Error getting hidden exhibits: {e}")
                    exhibits = Exhibit.objects.none()
            else:
                # Optimized query: Get exhibits where user is owner OR collaborator in a single query
                exhibits = Exhibit.objects.filter(
                    __raw__={
                        "$or": [
                            {"owner": user.id},
                            {"collaborators": user.id}
                        ]
                    }
                )

                # Filter based on visibility
                if not include_deleted:
                    exhibits = exhibits.filter(visibility__ne="Deleted")
                if not include_archived:
                    exhibits = exhibits.filter(visibility__ne="Archived")
                
                # Filter out hidden exhibits
                try:
                    hidden_contents = HiddenContent.objects.filter(user=user, content_type='exhibit')
                    if hidden_contents:
                        hidden_exhibit_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                        exhibits = exhibits.filter(id__nin=hidden_exhibit_ids)
                except Exception as e:
                    # If there's an error getting hidden exhibits, just continue without filtering
                    pass

            serializer = ExhibitCardSerializer(exhibits, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("🔥 ERROR in MyExhibitCardListView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RestoreExhibitView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)
        except Exhibit.DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)

        if exhibit.owner.id != request.user.id:
            return Response(
                {"detail": "Not authorized to restore this exhibit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Restore the exhibit by setting visibility back to Public
        exhibit.visibility = "Public"
        exhibit.updated_at = datetime.utcnow()
        exhibit.save()

        return Response(
            {"detail": "Exhibit restored successfully."},
            status=status.HTTP_200_OK,
        )


class RestoreAllExhibitsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user
            
            # Get all deleted exhibits owned by the user
            deleted_exhibits = Exhibit.objects.filter(
                owner=user,
                visibility="Deleted"
            )
            
            count = deleted_exhibits.count()
            
            # Restore all deleted exhibits
            deleted_exhibits.update(
                visibility="Public",
                updated_at=datetime.utcnow()
            )
            
            return Response(
                {"message": f"Successfully restored {count} exhibits."},
                status=status.HTTP_200_OK,
            )
            
        except Exception as e:
            print("🔥 ERROR in RestoreAllExhibitsView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserExhibitCardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            # Get the target user
            target_user = User.objects.get(id=user_id)
            
            # Optimized query: Get public exhibits where target user is owner OR collaborator
            exhibits = Exhibit.objects.filter(
                visibility='Public',
                __raw__={
                    "$or": [
                        {"owner": target_user.id},
                        {"collaborators": target_user.id}
                    ]
                }
            ).order_by('-created_at')

            serializer = ExhibitCardSerializer(exhibits, many=True, context={'request': request, 'target_user_id': user_id})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("🔥 ERROR in UserExhibitCardListView:", e)
            return Response({"error": "Failed to retrieve user exhibits"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




            
class ExhibitCardDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)
        except Exhibit.DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        if user not in exhibit.viewed_by:
            exhibit.viewed_by.append(user)
            exhibit.save()

      
        contributions = ExhibitContribution.objects(exhibit=exhibit)

        contributed_artworks = []
        slot_artwork_map = {}

        for contrib in contributions:
            for entry in contrib.artworks:
                if entry.artwork:
                    contributed_artworks.append(entry.artwork)
                    slot_artwork_map[str(entry.slot_number)] = str(entry.artwork.id)

        direct_artworks = exhibit.artworks or []
        for i, art in enumerate(direct_artworks):
            if art:
                slot_artwork_map[str(i + 1)] = str(art.id)

   
        all_artworks = list({str(a.id): a for a in direct_artworks + contributed_artworks}.values())

        serializer = ExhibitCardSerializer(exhibit, context={
            "request": request,
            "all_artworks": all_artworks,
            "slot_artwork_map": slot_artwork_map,
        })
        return Response(serializer.data, status=status.HTTP_200_OK)



class PublishExhibitView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)

            if exhibit.visibility == "Public":
                return Response({"detail": "Exhibit already published."}, status=status.HTTP_400_BAD_REQUEST)

            exhibit.visibility = "Public"
            exhibit.updated_at = datetime.utcnow()
            exhibit.save()

            return Response({"detail": "Exhibit published successfully."}, status=status.HTTP_200_OK)
        except Exhibit.DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)


class DeleteExhibitView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)

            if exhibit.owner.id != request.user.id:
                return Response(
                    {"detail": "Not authorized to delete this exhibit."},
                    status=status.HTTP_403_FORBIDDEN,
                )

         
            if exhibit.visibility != "Deleted":
                exhibit.visibility = "Deleted"
                exhibit.save(update_fields=["visibility", "updated_at"])
                return Response(
                    {"detail": "Exhibit moved to trash."},
                    status=status.HTTP_200_OK,
                )

         
            exhibit.delete()
            return Response(
                {"detail": "Exhibit permanently deleted."},
                status=status.HTTP_200_OK,
            )

        except Exhibit.DoesNotExist:
            return Response(
                {"detail": "Exhibit not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
            
class ToggleVisibilityExhibitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)
        except Exhibit.DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)

        if str(exhibit.owner.id) != str(request.user.id):
            return Response(
                {"detail": "Not authorized to change visibility of this exhibit."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if exhibit.visibility == "Public":
            exhibit.visibility = "Private"
            message = "Exhibit successfully set to Private."
        else:
            exhibit.visibility = "Public"
            message = "Exhibit successfully set to Public."

        exhibit.updated_at = datetime.utcnow()
        exhibit.save()

        return Response(
            {"detail": message, "new_visibility": exhibit.visibility},
            status=status.HTTP_200_OK,
        )


class ToggleHideExhibitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)
            user = User.objects.get(id=ObjectId(request.user.id))
        except Exhibit.DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if exhibit is already hidden by this user
        existing_hidden = HiddenContent.objects.filter(
            user=user, 
            content_type='exhibit', 
            content_id=str(exhibit.id)
        ).first()
        
        if existing_hidden:
            # Unhide the exhibit for this user
            existing_hidden.delete()
            message = "Exhibit successfully unhidden."
        else:
            # Hide the exhibit for this user
            hidden_content = HiddenContent(
                user=user,
                content_type='exhibit',
                content_id=str(exhibit.id),
                hidden_at=datetime.utcnow()
            )
            hidden_content.save()
            message = "Exhibit successfully hidden."

        return Response(
            {"detail": message},
            status=status.HTTP_200_OK,
        )


class BulkUnhideExhibitsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            user = User.objects.get(id=ObjectId(request.user.id))
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Remove all hidden content records for exhibits for this user
        hidden_contents = HiddenContent.objects.filter(
            user=user,
            content_type='exhibit'
        )
        
        count = hidden_contents.count()
        hidden_contents.delete()

        return Response(
            {"message": f"Successfully unhid {count} exhibits.", "count": count},
            status=status.HTTP_200_OK,
        )