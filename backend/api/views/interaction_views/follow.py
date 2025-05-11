from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.interaction_model.follows import Follower
from api.models.user_model.users import User
from api.serializers.interaction_s.follow import FollowSerializer
from rest_framework.permissions import IsAuthenticated
from api.models.interaction_model.notification import Notification
from api.serializers.user_s.users_serializers import UserSerializer 

class FollowCreateView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request, *args, **kwargs):
        user = request.user
        following_id = request.data.get('following') 
        
        if not following_id:
            return Response({"detail": "Following user ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        if user.id == following.id:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        
       
        existing_follow = Follower.objects.filter(follower=user, following=following).first()
        
        if existing_follow:
            return Response({"detail": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)
        
       
        follow = Follower.objects.create(follower=user, following=following)
        message = f"{user.first_name} is now following you."
        Notification.objects.create(user=following, message=message)
        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)


class UnfollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        following_id = request.data.get('following') 
        if not following_id:
            return Response({"detail": "Following user ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        follow = Follower.objects.filter(follower=user, following=following).first()
        
        if not follow:
            return Response({"detail": "You are not following this user."}, status=status.HTTP_400_BAD_REQUEST)
        
       
        follow.delete()
        return Response({"detail": "Successfully unfollowed the user."}, status=status.HTTP_200_OK)

class FollowerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
       
        user = request.user
        followers = Follower.objects.filter(following=user)
        follower_data = [{"follower": f.follower} for f in followers] 
        
        follower_serializer = FollowSerializer(follower_data, many=True)

        return Response(follower_serializer.data, status=status.HTTP_200_OK)
    
class FollowStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

       
        followers = Follower.objects.filter(following=user)
        followers_list = [f.follower for f in followers]
        follower_count = followers.count()

      
        following = Follower.objects.filter(follower=user)
        following_list = [f.following for f in following]
        following_count = following.count()

       
        followers_serialized = UserSerializer(followers_list, many=True).data
        following_serialized = UserSerializer(following_list, many=True).data

        return Response({
            "follower_count": follower_count,
            "followers": followers_serialized,
            "following_count": following_count,
            "following": following_serialized
        }, status=200)