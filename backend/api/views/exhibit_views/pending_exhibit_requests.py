
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

        # 1. Collaborative exhibits owned by the user - optimized query
        owned_exhibits = Exhibit.objects(
            owner=user,
            exhibit_type="Collaborative",
            visibility__ne="Public"  # Exclude already published
        ).only('id', 'title', 'collaborators')  # Only fetch needed fields

        for exhibit in owned_exhibits:
            total = len(exhibit.collaborators)
            # Optimized query: Get distinct contributor count directly
            submitted_contributors = ExhibitContribution.objects(exhibit=exhibit).distinct('contributor')
            submitted_count = len(submitted_contributors)

            if submitted_count < total:
                pending_requests.append({
                    "id": str(exhibit.id),
                    "exhibitTitle": exhibit.title,
                    "status": f"{submitted_count}/{total} submissions",
                    "exhibitId": str(exhibit.id),
                    "isOwner": True,
                    "type": "pending",
                    "exhibitType": exhibit.exhibit_type,
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
                    "exhibitType": exhibit.exhibit_type,
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
                "type": "pending",
                "exhibitType": exhibit.exhibit_type
            })
        
        # 3. User is in exhibit.collaborators - include both published and non-published exhibits
        collaborative_exhibits = Exhibit.objects(
            collaborators=user,
            exhibit_type="Collaborative"
        ).only('id', 'title', 'collaborators', 'visibility')

        # Pre-fetch all user contributions to avoid N+1 queries
        user_contributions_query = ExhibitContribution.objects(contributor=user).only('exhibit')
        user_contributions = set(str(contrib.exhibit.id) for contrib in user_contributions_query)

        for exhibit in collaborative_exhibits:
            has_submitted = str(exhibit.id) in user_contributions
            
            if not has_submitted:
                # User hasn't submitted yet
                pending_requests.append({
                    "id": str(exhibit.id),
                    "exhibitTitle": exhibit.title,
                    "status": "Pending your contribution",
                    "exhibitId": str(exhibit.id),
                    "isOwner": False,
                    "type": "pending",
                    "exhibitType": exhibit.exhibit_type
                })
            else:
                # User has submitted, check exhibit status
                total_collaborators = len(exhibit.collaborators)
                submitted_contributors = ExhibitContribution.objects(exhibit=exhibit).distinct('contributor')
                submitted_count = len(submitted_contributors)
                
                if exhibit.visibility == "Public":
                    # Exhibit is published - show as contributed
                    pending_requests.append({
                        "id": str(exhibit.id),
                        "exhibitTitle": exhibit.title,
                        "status": "Exhibit is now live! Your contribution is part of this published exhibit.",
                        "exhibitId": str(exhibit.id),
                        "isOwner": False,
                        "type": "contributed",
                        "exhibitType": exhibit.exhibit_type,
                        "collaboratorsSubmitted": submitted_count,
                        "totalCollaborators": total_collaborators,
                        "hasUserSubmitted": True
                    })
                elif submitted_count < total_collaborators:
                    # User has submitted but others haven't finished yet
                    pending_requests.append({
                        "id": str(exhibit.id),
                        "exhibitTitle": exhibit.title,
                        "status": f"You've submitted. Waiting for others ({submitted_count}/{total_collaborators})",
                        "exhibitId": str(exhibit.id),
                        "isOwner": False,
                        "type": "contributed",
                        "exhibitType": exhibit.exhibit_type,
                        "collaboratorsSubmitted": submitted_count,
                        "totalCollaborators": total_collaborators,
                        "hasUserSubmitted": True
                    })
                # If all have submitted but not published, the owner will see it as "ready" in section 1

        # Serialize and return
        serializer = PendingExhibitRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)
