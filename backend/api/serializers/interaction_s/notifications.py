from rest_framework import serializers
from django.utils.timesince import timesince
from api.models.interaction_model.notification import Notification
from api.serializers.user_s.users_serializers import UserSerializer

class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)

    actor = UserSerializer(read_only=True) 

    name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    message = serializers.CharField(required=False, allow_blank=True)
    action = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    target = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    icon = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    amount = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    forAmount = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    token = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    link = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    donation = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    is_read = serializers.BooleanField(default=False)
    check = serializers.BooleanField(required=False)
    money = serializers.BooleanField(required=False)

    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    time = serializers.SerializerMethodField()

    def get_time(self, obj):
        if obj.created_at:
            return timesince(obj.created_at) + " ago"
        return ""
