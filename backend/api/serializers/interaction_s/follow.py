from rest_framework import serializers
from api.models.user_model.users import User 
from api.models.interaction_model.follows import Follower
from api.serializers.user_s.users_serializers import UserSerializer

class FollowSerializer(serializers.Serializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    followed_at = serializers.DateTimeField(read_only=True)



    

