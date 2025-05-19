from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.serializers.exhibit_s.exhibit_contribution import ExhibitContributionSerializer
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution

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
