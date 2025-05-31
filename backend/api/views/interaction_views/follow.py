from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.interaction_model.follows import Follower
from api.models.user_model.users import User
from api.serializers.interaction_s.follow import FollowSerializer
from rest_framework.permissions import IsAuthenticated
from api.models.interaction_model.notification import Notification
from api.serializers.user_s.users_serializers import UserSerializer 
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from django.utils.timesince import timesince
from api.models.artwork_model.artwork import Art
from django.db.models import Q

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

        host = request.get_host()
        protocol = "http" if "localhost" in host else "https"
        link = f"/userprofile/{str(user.id)}"  

        Notification.objects.create(
            user=following, 
            actor=user,     
            message=f"{user.first_name} is now following you.",
            name=f"{user.first_name} {user.last_name}",
            action="followed you",
            icon="👥",
            created_at=datetime.now(),
            link=link,
        )


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

class CheckFollowStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        following_id = request.query_params.get('following') 

        if not following_id:
            return Response({"detail": "Following user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        
        is_following = Follower.objects.filter(follower=user, following=following).count() > 0
        return Response({"is_following": is_following}, status=status.HTTP_200_OK)
    
class FollowedArtworksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        followed_ids = [f.following for f in Follower.objects(follower=user)]

        if not followed_ids:
            return Response({
                "total": 0,
                "artworks": [],
                "message": "You are not following any users yet."
            }, status=status.HTTP_200_OK)

        artworks_queryset = Art.objects(
            artist__in=followed_ids,
            visibility="Public",
            art_status="Active"
        ).order_by('-created_at')

        total = artworks_queryset.count()
        artworks = artworks_queryset  

        serialized = ArtSerializer(artworks, many=True)
        return Response({
            "total": total,
            "artworks": serialized.data,
        }, status=status.HTTP_200_OK)



    
class FollowerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
       
        user_id = request.query_params.get('user_id')

        if user_id:
          
            followers = Follower.objects.filter(following=user_id)
        else:
            followers = Follower.objects.filter(following=request.user)

        follower_users = [f.follower for f in followers]
        serializer = UserSerializer(follower_users, many=True)
        return Response(serializer.data)

class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')

        if user_id:
            following = Follower.objects.filter(follower=user_id)
        else:
            following = Follower.objects.filter(follower=request.user)

        following_users = [f.following for f in following]
        serializer = UserSerializer(following_users, many=True)
        return Response(serializer.data)


class FollowCountsView(APIView):
    def get(self, request, pk, *args, **kwargs):
        if not ObjectId.is_valid(pk):
            return Response({"detail": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=ObjectId(pk))
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        followers_count = Follower.objects(following=user).count()
        following_count = Follower.objects(follower=user).count()

        return Response({
            "followers": followers_count,
            "following": following_count
        }, status=status.HTTP_200_OK)

         
class FollowStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')

        if user_id:
            user = User.objects.get(id=user_id)
        else:
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

class RemoveFollowerView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        follower_id = request.data.get('follower_id')
        if not follower_id:
            return Response({"detail": "follower_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        try:
          
            follow_instance = Follower.objects.get(follower=follower_id, following=user)
            follow_instance.delete()
            return Response({"detail": "Follower removed successfully."}, status=status.HTTP_200_OK)
        except Follower.DoesNotExist:
            return Response({"detail": "Follower relationship does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": f"Error removing follower: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)