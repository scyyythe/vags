from rest_framework import serializers
from api.models.interaction_model.notification import Notification
from api.serializers.user_s.users_serializers import UserSerializer
class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True) 
    avatar = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField()
    action = serializers.CharField(required=False, allow_blank=True)
    target = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    is_read = serializers.BooleanField(default=False)
    check = serializers.BooleanField(required=False)
    money = serializers.BooleanField(required=False)
    icon = serializers.CharField(required=False, allow_blank=True)
    amount = serializers.CharField(required=False, allow_blank=True)
    forAmount = serializers.CharField(required=False, allow_blank=True)
    token = serializers.CharField(required=False, allow_blank=True)
    link = serializers.CharField(required=False, allow_blank=True)
    donation = serializers.CharField(required=False, allow_blank=True)
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M:%S")
    time = serializers.CharField(required=False)
