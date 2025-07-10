from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.serializers.exhibit_s.exhibit_contribution import ExhibitContributionSerializer
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from rest_framework.permissions import IsAuthenticated
from mongoengine.errors import DoesNotExist, ValidationError

from api.models.exhibit_model.exhibit import Exhibit
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.models.artwork_model.artwork import Art
from api.serializers.exhibit_s.exhibit_contribution import ExhibitContributionSerializer
from api.serializers.exhibit_s.collaborator_exhibit_view import CollaboratorExhibitViewSerializer
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
        data = request.data.get("artworks") 

        if not isinstance(data, list):
            return Response({"detail": "Invalid format. 'artworks' must be a list."}, status=400)

        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)
        except DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=404)

        if user not in exhibit.collaborators:
            return Response({"detail": "You are not a collaborator of this exhibit."}, status=403)

        slot_owner_map = CollaboratorExhibitViewSerializer().get_slotOwnerMap(exhibit)
        contributions_to_insert = []

        for entry in data:
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

            if ExhibitContribution.objects(exhibit=exhibit, slot_number=slot).first():
                return Response({"detail": f"Slot {slot} is already filled."}, status=400)

            try:
                artwork = Art.objects.get(id=artwork_id)
            except DoesNotExist:
                return Response({"detail": f"Artwork {artwork_id} not found."}, status=404)

            contributions_to_insert.append(ExhibitContribution(
                exhibit=exhibit,
                contributor=user,
                artwork=artwork,
                slot_number=slot
            ))

        ExhibitContribution.objects.insert(contributions_to_insert)

        serializer = ExhibitContributionSerializer(contributions_to_insert, many=True)
        return Response({
            "contributor": str(user.id),
            "exhibit": str(exhibit.id),
            "artworks": serializer.data
        }, status=status.HTTP_201_CREATED)
