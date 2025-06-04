from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.user_s.users_serializers import UserSerializer 

from datetime import datetime

class PromoteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, user_id):
        if not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(id=ObjectId(user_id)).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        role_hierarchy = ["User", "Moderator", "Admin"]
        try:
            current_index = role_hierarchy.index(user.role)
        except ValueError:
            current_index = 0

        if current_index >= len(role_hierarchy) - 1:
            return Response({"detail": "User is already at highest role."}, status=status.HTTP_400_BAD_REQUEST)

        old_role = user.role
        new_role = role_hierarchy[current_index + 1]
        user.role = new_role
        user.save()
    
        # Notification.objects.create(
        #     user=user,
        #     actor=request.user,
        #     message=f"Congratulations! You have been promoted from {old_role} to {new_role}.",
        #     name=f"{request.user.first_name} {request.user.last_name}",
        #     action="promoted you",
        #     target=new_role,
        #     icon="promotion",  
        #     created_at=datetime.utcnow(),
        #     link=f"/userprofile/{str(user.id)}" 
        # )

        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DemoteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, user_id):
        if not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(id=ObjectId(user_id)).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        role_hierarchy = ["User", "Moderator", "Admin"]
        try:
            current_index = role_hierarchy.index(user.role)
        except ValueError:
            current_index = 0

        if current_index <= 0:
            return Response({"detail": "User is already at lowest role."}, status=status.HTTP_400_BAD_REQUEST)

        old_role = user.role
        new_role = role_hierarchy[current_index - 1]
        user.role = new_role
        user.save()

        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
