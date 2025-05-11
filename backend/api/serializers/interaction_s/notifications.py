from rest_framework import serializers
from api.models.interaction_model.notification import Notification
class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = serializers.CharField()
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

    def to_representation(self, instance):
        formatted_time = instance.created_at.strftime("%Y-%m-%d %H:%M:%S") if instance.created_at else None
        return {
            "id": str(instance.id),
            "user": str(instance.user.id) if instance.user else None,
            "avatar": instance.avatar or "",
            "name": instance.name or "",
            "message": instance.message,
            "action": instance.action or "",
            "target": instance.target or "",
            "created_at": formatted_time,
            "date": formatted_time,
            "time": instance.time or "", 
            "is_read": instance.is_read,
            "check": instance.check,
            "money": instance.money,
            "icon": instance.icon or "",
            "amount": instance.amount or "",
            "forAmount": instance.forAmount or "",
            "token": instance.token or "",
            "link": instance.link or "",
            "donation": instance.donation or ""
        }
