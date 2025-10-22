from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from mongoengine.errors import DoesNotExist
from datetime import datetime

from api.models.exhibit_model.exhibit import Exhibit
from api.models.artwork_model.artwork import Art
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution, ArtworkEntry
from api.serializers.exhibit_s.exhibit_contribution import ExhibitContributionSerializer
from api.serializers.exhibit_s.collaborator_exhibit_view import CollaboratorExhibitViewSerializer
from api.models.interaction_model.notification import Notification

class ExhibitContributionCreateView(APIView):
    def post(self, request):
        serializer = ExhibitContributionSerializer(data=request.data)
        if serializer.is_valid():
            contribution = serializer.save()
            
            return Response(ExhibitContributionSerializer(contribution).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExhibitContributionListView(APIView):
    def get(self, request):
        contributions = ExhibitContribution.objects.all()
        serializer = ExhibitContributionSerializer(contributions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class SubmitCollaboratorContributionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exhibit_id):
        user = request.user
        artworks_data = request.data.get("artworks")

        if not isinstance(artworks_data, list):
            return Response({"detail": "Invalid format. 'artworks' must be a list."}, status=400)

        try:
            # Optimized query: Fetch necessary fields including slot distribution data
            exhibit = Exhibit.objects.only('id', 'title', 'owner', 'collaborators', 'chosen_env', 'exhibit_type').get(id=exhibit_id)
        except DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=404)

        if user not in exhibit.collaborators:
            return Response({"detail": "You are not a collaborator of this exhibit."}, status=403)

        # Fetch existing contribution or create a new one
        contribution = ExhibitContribution.objects(exhibit=exhibit, contributor=user).first()
        if not contribution:
            contribution = ExhibitContribution(exhibit=exhibit, contributor=user, artworks=[])

        slot_owner_map = CollaboratorExhibitViewSerializer().get_slotOwnerMap(exhibit)
        
        # Pre-validate all entries to avoid partial saves
        validated_entries = []
        artwork_ids = [entry.get("artwork") for entry in artworks_data if entry.get("artwork")]
        
        # Batch fetch all artworks to avoid N+1 queries
        artworks_dict = {str(art.id): art for art in Art.objects(id__in=artwork_ids)}
        
        for entry in artworks_data:
            slot = entry.get("slot_number")
            artwork_id = entry.get("artwork")

            if slot is None or not artwork_id:
                return Response({"detail": "Each item must include 'artwork' and 'slot_number'."}, status=400)

            try:
                slot = int(slot)
            except ValueError:
                return Response({"detail": f"Invalid slot number: {slot}"}, status=400)

            if str(slot_owner_map.get(slot)) != str(user.id):
                return Response({"detail": f"Slot {slot} is not assigned to you."}, status=400)

            # Prevent slot duplicates
            if any(a.slot_number == slot for a in contribution.artworks):
                return Response({"detail": f"Slot {slot} already exists in your contributions."}, status=400)

            # Check if artwork exists in our batch
            if artwork_id not in artworks_dict:
                return Response({"detail": f"Artwork {artwork_id} not found."}, status=404)

            # Add validated entry to batch
            validated_entries.append(
                ArtworkEntry(artwork=artworks_dict[artwork_id], slot_number=slot, contributed_at=datetime.utcnow())
            )

        # Add all validated entries at once
        contribution.artworks.extend(validated_entries)
        
        # Save the updated single document
        contribution.save()

        # Send notifications to owner and other collaborators
        contributor_name = f"{user.first_name} {user.last_name}".strip()
        exhibit_title = exhibit.title
        artworks_count = len(artworks_data)
        
        # Notify the exhibit owner
        if str(exhibit.owner.id) != str(user.id):  
            Notification.objects.create(
                user=exhibit.owner,
                actor=user,
                message=f"contributed {artworks_count} artwork{'s' if artworks_count > 1 else ''} to '{exhibit_title}'. You can check the exhibit now!",
                exhibit=exhibit,
                name=contributor_name,
                action="contributed to your exhibit",
                target=exhibit_title,
                icon="collaborate",
                link=f"/exhibitreview?id={exhibit.id}",
                created_at=datetime.now()
            )
        
        # Notify other collaborators
        for collaborator in exhibit.collaborators:
            if str(collaborator.id) != str(user.id) and str(collaborator.id) != str(exhibit.owner.id):  # Don't notify self or owner (already notified above)
                Notification.objects.create(
                    user=collaborator,
                    actor=user,
                    message=f"contributed {artworks_count} artwork{'s' if artworks_count > 1 else ''} to '{exhibit_title}'. You can check the exhibit now!",
                    exhibit=exhibit,
                    name=contributor_name,
                    action="contributed to the exhibit",
                    target=exhibit_title,
                    icon="collaborate",
                    link=f"/exhibitreview?id={exhibit.id}",
                    created_at=datetime.utcnow()
                )

        serializer = ExhibitContributionSerializer(contribution)
        return Response({
            "contributor": str(user.id),
            "exhibit": str(exhibit.id),
            "artworks": serializer.data["artworks"]
        }, status=status.HTTP_201_CREATED)

    def put(self, request, exhibit_id):
        """Update existing contribution - replaces all artworks for the user"""
        user = request.user
        artworks_data = request.data.get("artworks")

        if not isinstance(artworks_data, list):
            return Response({"detail": "Invalid format. 'artworks' must be a list."}, status=400)

        try:
            # Optimized query: Fetch necessary fields including slot distribution data
            exhibit = Exhibit.objects.only('id', 'title', 'owner', 'collaborators', 'chosen_env', 'exhibit_type').get(id=exhibit_id)
        except DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=404)

        if user not in exhibit.collaborators:
            return Response({"detail": "You are not a collaborator of this exhibit."}, status=403)

        # Check if exhibit is already published
        if exhibit.visibility == "Public":
            return Response({"detail": "Cannot update contributions for a published exhibit."}, status=400)

        # Fetch existing contribution
        contribution = ExhibitContribution.objects(exhibit=exhibit, contributor=user).first()
        if not contribution:
            return Response({"detail": "No contribution found to update."}, status=404)

        slot_owner_map = CollaboratorExhibitViewSerializer().get_slotOwnerMap(exhibit)
        
        # Pre-validate all entries to avoid partial saves
        validated_entries = []
        artwork_ids = [entry.get("artwork") for entry in artworks_data if entry.get("artwork")]
        
        # Batch fetch all artworks to avoid N+1 queries
        artworks_dict = {str(art.id): art for art in Art.objects(id__in=artwork_ids)}
        
        for entry in artworks_data:
            slot = entry.get("slot_number")
            artwork_id = entry.get("artwork")

            if slot is None or not artwork_id:
                return Response({"detail": "Each item must include 'artwork' and 'slot_number'."}, status=400)

            try:
                slot = int(slot)
            except ValueError:
                return Response({"detail": f"Invalid slot number: {slot}"}, status=400)

            if str(slot_owner_map.get(slot)) != str(user.id):
                return Response({"detail": f"Slot {slot} is not assigned to you."}, status=400)

            # Check if artwork exists in our batch
            if artwork_id not in artworks_dict:
                return Response({"detail": f"Artwork {artwork_id} not found."}, status=404)

            # Add validated entry to batch
            validated_entries.append(
                ArtworkEntry(artwork=artworks_dict[artwork_id], slot_number=slot, contributed_at=datetime.utcnow())
            )

        # Replace all artworks (clear existing and add new ones)
        contribution.artworks = validated_entries
        
        # Save the updated single document
        contribution.save()

        # Send notifications to owner and other collaborators
        contributor_name = f"{user.first_name} {user.last_name}".strip()
        exhibit_title = exhibit.title
        artworks_count = len(artworks_data)
        
        # Notify the exhibit owner
        if str(exhibit.owner.id) != str(user.id):  
            Notification.objects.create(
                user=exhibit.owner,
                actor=user,
                message=f"updated their contribution with {artworks_count} artwork{'s' if artworks_count > 1 else ''} in '{exhibit_title}'. You can check the exhibit now!",
                exhibit=exhibit,
                name=contributor_name,
                action="updated their contribution",
                target=exhibit_title,
                icon="collaborate",
                link=f"/exhibitreview?id={exhibit.id}",
                created_at=datetime.now()
            )
        
        # Notify other collaborators
        for collaborator in exhibit.collaborators:
            if str(collaborator.id) != str(user.id) and str(collaborator.id) != str(exhibit.owner.id):  # Don't notify self or owner (already notified above)
                Notification.objects.create(
                    user=collaborator,
                    actor=user,
                    message=f"updated their contribution with {artworks_count} artwork{'s' if artworks_count > 1 else ''} in '{exhibit_title}'. You can check the exhibit now!",
                    exhibit=exhibit,
                    name=contributor_name,
                    action="updated their contribution",
                    target=exhibit_title,
                    icon="collaborate",
                    link=f"/exhibitreview?id={exhibit.id}",
                    created_at=datetime.utcnow()
                )

        serializer = ExhibitContributionSerializer(contribution)
        return Response({
            "contributor": str(user.id),
            "exhibit": str(exhibit.id),
            "artworks": serializer.data["artworks"]
        }, status=status.HTTP_200_OK)