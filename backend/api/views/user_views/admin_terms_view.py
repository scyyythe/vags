from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from api.serializers.user_s.users_serializers import UserSerializer
from bson import ObjectId
import traceback


class AcceptAdminTermsView(APIView):
    """
    View to handle admin terms and conditions acceptance
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        try:
            # Validate user ID format
            if not ObjectId.is_valid(user_id):
                return Response(
                    {"error": "Invalid user ID format."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the user
            try:
                user = User.objects.get(id=ObjectId(user_id))
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check if the user is trying to modify their own account
            if str(user.id) != str(request.user.id):
                return Response(
                    {"error": "You can only accept terms for your own account."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if user is Admin or Moderator
            if user.role not in ['Admin', 'Moderator']:
                return Response(
                    {"error": "Admin terms and conditions only apply to Admin and Moderator roles."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the acceptance data from request
            admin_terms_accepted = request.data.get('admin_terms_accepted')
            admin_terms_accepted_at = request.data.get('admin_terms_accepted_at')

            if not admin_terms_accepted:
                return Response(
                    {"error": "admin_terms_accepted must be true to accept terms."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update user admin terms acceptance
            user.admin_terms_accepted = True
            user.admin_terms_accepted_at = datetime.utcnow()
            user.save()

            # Return updated user data
            serializer = UserSerializer(user, context={'request': request})
            return Response({
                "message": "Admin terms and conditions accepted successfully.",
                "user": serializer.data,
                "admin_terms_accepted": user.admin_terms_accepted
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
