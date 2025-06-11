from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,parsers
from api.serializers.exhibit_s.exhibit_seriliazers import ExhibitSerializer
from api.models.exhibit_model.exhibit import Exhibit
from api.serializers.exhibit_s.exhibit_card import ExhibitCardSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import generics, permissions
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
        exhibits = Exhibit.objects.filter(visibility='Pending')
        serializer = ExhibitCardSerializer(exhibits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

        serializer = ExhibitCardSerializer(exhibit)
        return Response(serializer.data, status=status.HTTP_200_OK)

