# views/exhibit_review_view.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from mongoengine.errors import DoesNotExist
from api.models.exhibit_model.exhibit import Exhibit
from api.serializers.exhibit_s.exhibit_review_serializer import ExhibitReviewSerializer

class ExhibitReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exhibit_id):
        try:
            exhibit = Exhibit.objects.get(id=exhibit_id)
        except DoesNotExist:
            return Response({"detail": "Exhibit not found."}, status=404)

        serializer = ExhibitReviewSerializer(exhibit, context={"request": request})
        return Response(serializer.data)
