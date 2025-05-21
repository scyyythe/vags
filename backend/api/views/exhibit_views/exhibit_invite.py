from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.serializers.exhibit_s.exhibit_invite import ExhibitInvitationSerializer
from api.models.exhibit_model.exhibit_invitation import ExhibitInvitation

class ExhibitInvitationCreateView(APIView):
    def post(self, request):
        serializer = ExhibitInvitationSerializer(data=request.data)
        if serializer.is_valid():
            invitation = serializer.save()
            
            return Response(ExhibitInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExhibitInvitationListView(APIView):
    def get(self, request):
        invitations = ExhibitInvitation.objects.all()
        serializer = ExhibitInvitationSerializer(invitations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)