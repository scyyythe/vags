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
            exhibit = Exhibit.objects.get(id=exhibit_id)
        except DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=404)

        if user not in exhibit.collaborators:
            return Response({"detail": "You are not a collaborator of this exhibit."}, status=403)

        # Fetch existing contribution or create a new one
        contribution = ExhibitContribution.objects(exhibit=exhibit, contributor=user).first()
        if not contribution:
            contribution = ExhibitContribution(exhibit=exhibit, contributor=user, artworks=[])

        slot_owner_map = CollaboratorExhibitViewSerializer().get_slotOwnerMap(exhibit)

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

            try:
                artwork = Art.objects.get(id=artwork_id)
            except DoesNotExist:
                return Response({"detail": f"Artwork {artwork_id} not found."}, status=404)

            # Add new entry
            contribution.artworks.append(
                ArtworkEntry(artwork=artwork, slot_number=slot, contributed_at=datetime.utcnow())
            )

        # Save the updated single document
        contribution.save()

        # Send notifications to owner and other collaborators
        contributor_name = f"{user.first_name} {user.last_name}".strip()
        exhibit_title = exhibit.title
        artworks_count = len(artworks_data)
        
        # Notify the exhibit owner
        if str(exhibit.owner.id) != str(user.id):  # Don't notify self
            Notification.objects.create(
                user=exhibit.owner,
                actor=user,
                message=f"{contributor_name} contributed {artworks_count} artwork{'s' if artworks_count > 1 else ''} to '{exhibit_title}'. You can check the exhibit now!",
                exhibit=exhibit,
                name=contributor_name,
                action="contributed to your exhibit",
                target=exhibit_title,
                icon="collaborate",
                link=f"/exhibits/{exhibit.id}/",
                created_at=datetime.utcnow()
            )
        
        # Notify other collaborators
        for collaborator in exhibit.collaborators:
            if str(collaborator.id) != str(user.id) and str(collaborator.id) != str(exhibit.owner.id):  # Don't notify self or owner (already notified above)
                Notification.objects.create(
                    user=collaborator,
                    actor=user,
                    message=f"{contributor_name} contributed {artworks_count} artwork{'s' if artworks_count > 1 else ''} to '{exhibit_title}'. You can check the exhibit now!",
                    exhibit=exhibit,
                    name=contributor_name,
                    action="contributed to the exhibit",
                    target=exhibit_title,
                    icon="collaborate",
                    link=f"/exhibits/{exhibit.id}/",
                    created_at=datetime.utcnow()
                )

        serializer = ExhibitContributionSerializer(contribution)
        return Response({
            "contributor": str(user.id),
            "exhibit": str(exhibit.id),
            "artworks": serializer.data["artworks"]
        }, status=status.HTTP_201_CREATED)