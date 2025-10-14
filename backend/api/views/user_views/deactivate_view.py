from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from api.serializers.user_s.users_serializers import UserSerializer
from bson import ObjectId
import traceback


class DeactivateAccountView(APIView):
    """
    View to handle account deactivation and reactivation
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
                    {"error": "You can only deactivate your own account."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get the new status from request data
            new_status = request.data.get('user_status')
            deactivated_at = request.data.get('deactivated_at')

            if new_status not in ['active', 'deactivated']:
                return Response(
                    {"error": "Invalid status. Must be 'active' or 'deactivated'."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update user status
            user.user_status = new_status
            
            # Handle deactivated_at field
            if new_status == 'deactivated':
                if deactivated_at:
                    try:
                        # Parse the ISO string to datetime
                        user.deactivated_at = datetime.fromisoformat(deactivated_at.replace('Z', '+00:00'))
                    except ValueError:
                        # If parsing fails, use current time
                        user.deactivated_at = datetime.utcnow()
                else:
                    user.deactivated_at = datetime.utcnow()
            else:
                # If reactivating, clear the deactivated_at field
                user.deactivated_at = None

            # Update the updated_at timestamp
            user.updated_at = datetime.utcnow()
            
            # Save the user
            user.save()

            # Serialize and return the updated user
            serializer = UserSerializer(user, context={'request': request})
            
            return Response({
                "message": f"Account {new_status} successfully.",
                "user": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error in DeactivateAccountView:", e)
            traceback.print_exc()
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
