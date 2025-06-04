from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.user_s.users_serializers import UserSerializer 
from datetime import datetime
from api.models.admin.suspension.suspension_model import Suspension
from api.models.admin.ban.ban_model import Ban
from mongoengine import DoesNotExist
from datetime import timedelta
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

class SuspendUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        if not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(id=ObjectId(user_id)).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")
        reason = request.data.get("reason", "")

        try:
            start_date = datetime.fromisoformat(start_date)
            end_date = datetime.fromisoformat(end_date)
        except Exception:
            return Response({"error": "Invalid date format. Use ISO 8601 format."}, status=status.HTTP_400_BAD_REQUEST)

        if end_date <= start_date:
            return Response({"error": "End date must be after start date."}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_suspended:
            return Response({"detail": "User is already suspended."}, status=status.HTTP_400_BAD_REQUEST)

       
        Suspension.objects.create(
            user=user,
            start_date=start_date,
            end_date=end_date,
            reason=reason
        )

        
        user.user_status = "Suspended"
        user.save()

        admin_user = request.user
        mongo_admin_user = User.objects.get(id=ObjectId(admin_user.id))

        host = request.get_host()
        protocol = "http" if "localhost" in host else "https"
        link = f"/userprofile/{str(user.id)}"

        Notification.objects.create(
            user=user,
            actor=mongo_admin_user,
            message=f"Your account has been suspended from {start_date.date()} to {end_date.date()}.",
            name=f"{mongo_admin_user.first_name} {mongo_admin_user.last_name}",
            action="suspended your account",
            target=f"Suspension: {reason}",
            icon="ban",
            created_at=datetime.now(),
            link=link,
        )

        serializer = UserSerializer(user, context={"request": request})
        return Response({
            "message": f"User {user.username} has been suspended.",
            "suspension_period": {"start": start_date, "end": end_date},
            "user": serializer.data
        }, status=status.HTTP_200_OK)
        
class ReinstateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
       
        if not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

       
        user = User.objects(id=ObjectId(user_id)).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

       
        if user.user_status != "Suspended":
            return Response({"detail": "User is not suspended."}, status=status.HTTP_400_BAD_REQUEST)

      
        Suspension.objects(user=user).delete()

   
        user.user_status = "Active"
        user.save()

        admin_user = request.user
        mongo_admin_user = User.objects.get(id=ObjectId(admin_user.id))

        host = request.get_host()
        protocol = "http" if "localhost" in host else "https"
        link = f"/userprofile/{str(user.id)}"

    
        Notification.objects.create(
            user=user,
            actor=mongo_admin_user,
            message="Your account has been reinstated and is now active.",
            name=f"{mongo_admin_user.first_name} {mongo_admin_user.last_name}",
            action="reinstated your account",
            target="Reinstatement",
            icon="check-circle",
            created_at=datetime.now(),
            link=link,
        )

        serializer = UserSerializer(user, context={"request": request})
        return Response({
            "message": f"User {user.username} has been reinstated.",
            "user": serializer.data
        }, status=status.HTTP_200_OK)
        
        
class BanUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        if not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(id=ObjectId(user_id)).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        now = datetime.utcnow()

        if user.user_status == "Banned":
            return Response({"detail": "User is already banned."}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get("reason", "")
        is_permanent = request.data.get("is_permanent", True)
        start_date = now
        end_date = None

        if not is_permanent:
            end_date_str = request.data.get("end_date")
            if not end_date_str:
                return Response({"error": "End date required for temporary ban."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                end_date = datetime.fromisoformat(end_date_str)
            except Exception:
                return Response({"error": "Invalid end date format. Use ISO 8601."}, status=status.HTTP_400_BAD_REQUEST)
            if end_date <= start_date:
                return Response({"error": "End date must be in the future."}, status=status.HTTP_400_BAD_REQUEST)

        admin_user = User.objects(id=ObjectId(request.user.id)).first()

        Ban.objects.create(
            user=user,
            banned_by=admin_user,
            reason=reason,
            is_permanent=is_permanent,
            start_date=start_date,
            end_date=end_date
        )

        # Update user status
        user.user_status = "Banned"
        user.save()

        host = request.get_host()
        protocol = "http" if "localhost" in host else "https"
        link = f"/userprofile/{str(user.id)}"

        Notification.objects.create(
            user=user,
            actor=admin_user,
            message=f"Your account has been banned{' permanently' if is_permanent else f' until {end_date.date()}'}." + (f" Reason: {reason}" if reason else ""),
            name=f"{admin_user.first_name} {admin_user.last_name}",
            action="banned your account",
            target=f"Ban: {reason}" if reason else "Ban issued",
            icon="ban",
            created_at=datetime.utcnow(),
            link=link,
        )

        serializer = UserSerializer(user, context={"request": request})
        return Response({
            "message": f"User {user.username} has been banned.",
            "ban_details": {
                "permanent": is_permanent,
                "start": start_date,
                "end": end_date
            },
            "user": serializer.data
        }, status=status.HTTP_200_OK)

class UnbanUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, user_id):
        if not ObjectId.is_valid(user_id):
            return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(id=ObjectId(user_id)).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.user_status != "Banned":
            return Response({"detail": "User is not banned."}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.utcnow()
        active_ban = Ban.objects(
            user=user,
            start_date__lte=now,
            __raw__={"$or": [
                {"is_permanent": True},
                {"end_date": {"$gte": now}}
            ]}
        ).first()

        if active_ban:
            active_ban.end_date = now - timedelta(seconds=1)
            active_ban.save()

        user.user_status = "Active"
        user.save()

        admin_user = User.objects(id=ObjectId(request.user.id)).first()

        Notification.objects.create(
            user=user,
            actor=admin_user,
            message="Your account has been unbanned and reinstated.",
            name=f"{admin_user.first_name} {admin_user.last_name}",
            action="unbanned your account",
            target="Unban issued",
            icon="check_circle",
            created_at=now,
            link=f"/userprofile/{str(user.id)}",
        )

        serializer = UserSerializer(user, context={"request": request})
        return Response({
            "message": f"User {user.username} has been unbanned.",
            "user": serializer.data
        }, status=status.HTTP_200_OK)