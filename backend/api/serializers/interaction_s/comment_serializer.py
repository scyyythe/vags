
from rest_framework import serializers
from api.models.interaction_model.comment import Comment

class CommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    artwork = serializers.CharField()
    user = serializers.CharField(source="user.username", read_only=True)
    userImage = serializers.SerializerMethodField()
    text = serializers.CharField()
    likes = serializers.IntegerField(read_only=True)
    parentId = serializers.CharField(source="parent.id", required=False, allow_null=True)
    timestamp = serializers.DateTimeField()

    def get_userImage(self, obj):
        return getattr(obj.user, "profile_picture", None) or "https://i.pravatar.cc/150?u=default"
