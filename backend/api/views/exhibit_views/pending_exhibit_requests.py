
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models.exhibit_model.exhibit import Exhibit
from api.models.exhibit_model.exhibit_invitation import ExhibitInvitation
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.serializers.exhibit_s.pending_exhibit_request import PendingExhibitRequestSerializer

class MyPendingExhibitRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        pending_requests = []

        # 1. Collaborative exhibits owned by the user
        owned_exhibits = Exhibit.objects(
            owner=user,
            exhibit_type="Collaborative",
            visibility__ne="Public"  # Exclude already published
        )

        for exhibit in owned_exhibits:
            total = len(exhibit.collaborators)
            submitted = ExhibitContribution.objects(exhibit=exhibit).distinct('contributor')
            submitted_count = len(submitted)

            if submitted_count < total:
                pending_requests.append({
                    "id": str(exhibit.id),
                    "exhibitTitle": exhibit.title,
                    "status": f"{submitted_count}/{total} submissions",
                    "exhibitId": str(exhibit.id),
                    "isOwner": True,
                    "type": "pending",
                    "collaboratorsSubmitted": submitted_count,
                    "totalCollaborators": total
                })
            elif submitted_count == total:
                pending_requests.append({
                    "id": str(exhibit.id),
                    "exhibitTitle": exhibit.title,
                    "status": "All submissions received.",
                    "exhibitId": str(exhibit.id),
                    "isOwner": True,
                    "type": "ready",
                    "collaboratorsSubmitted": submitted_count,
                    "totalCollaborators": total
                })

        # 2. Invitations where the user is the invitee and status is pending
        invitations = ExhibitInvitation.objects(invitee=user, status="pending")

        for invite in invitations:
            exhibit = invite.exhibit
            pending_requests.append({
                "id": str(invite.id),
                "exhibitTitle": exhibit.title,
                "status": "Pending invitation acceptance",
                "exhibitId": str(exhibit.id),
                "isOwner": False,
                "type": "pending"
            })

        # Serialize and return
        serializer = PendingExhibitRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)
