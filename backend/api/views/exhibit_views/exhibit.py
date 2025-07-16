from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,parsers
from api.serializers.exhibit_s.exhibit_seriliazers import ExhibitSerializer
from api.models.exhibit_model.exhibit import Exhibit
from api.serializers.exhibit_s.exhibit_card import ExhibitCardSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from datetime import datetime
from rest_framework import status
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.models.artwork_model.artwork import Art


class ExhibitCreateView(APIView):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def post(self, request):
        serializer = ExhibitSerializer(data=request.data)
        if serializer.is_valid():
            exhibit = serializer.save()
            return Response(ExhibitSerializer(exhibit).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExhibitListView(APIView):
    def get(self, request):
        exhibits = Exhibit.objects.all()
        serializer = ExhibitSerializer(exhibits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ExhibitCardListView(APIView):
    def get(self, request):
        exhibits = Exhibit.objects.filter(visibility='Public')
        serializer = ExhibitCardSerializer(exhibits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
class MyExhibitCardListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_id = str(request.user.id)
            user = User.objects.get(id=user_id)  
            exhibits = Exhibit.objects.filter(owner=user)
            serializer = ExhibitCardSerializer(exhibits, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("🔥 ERROR in MyExhibitCardListView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
