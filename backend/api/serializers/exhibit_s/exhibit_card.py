from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from datetime import datetime
from api.models.interaction_model.interaction import Like
class ExhibitCardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField()
    image = serializers.SerializerMethodField()
    category = serializers.CharField()
    likes = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    isSolo = serializers.SerializerMethodField()
    isShared = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    
    exhibit_likes_count = serializers.SerializerMethodField()
    user_has_liked_exhibit = serializers.SerializerMethodField()

    def get_exhibit_likes_count(self, obj):
        return Like.objects(exhibit=obj).count()

    def get_user_has_liked_exhibit(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and not user.is_anonymous:
            return Like.objects(user=user, exhibit=obj).first() is not None
        return False
        
    def get_image(self, obj):
        return obj.banner or ""

    def get_likes(self, obj):
        return 1  

    def get_views(self, obj):
        return len(obj.viewed_by or [])

    def get_isSolo(self, obj):
        return obj.exhibit_type == 'Solo'

    def get_isShared(self, obj):
        return obj.exhibit_type == 'Collaborative'

    def get_collaborators(self, obj):
        return [
            {
                "id": str(user.id),
                "name": user.full_name,
                "avatar": user.avatar if hasattr(user, 'avatar') else ""
            }
            for user in obj.collaborators
        ]

    def get_owner(self, obj):
        owner = obj.owner
        return {
            "id": str(owner.id),
            "name": f"{owner.first_name} {owner.last_name}".strip(),
            "avatar": owner.avatar if hasattr(owner, 'avatar') else ""
        } if owner else None

