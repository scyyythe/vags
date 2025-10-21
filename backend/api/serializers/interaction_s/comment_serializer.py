from rest_framework import serializers

class CommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = serializers.CharField(read_only=True)
    text = serializers.CharField()
    likes = serializers.IntegerField(read_only=True)
    liked_by = serializers.SerializerMethodField()
    emoji_reactions = serializers.DictField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    
    def get_liked_by(self, obj):
        """Convert User objects to user IDs for JSON serialization"""
        if hasattr(obj, 'liked_by') and obj.liked_by:
            return [str(user_id) for user_id in obj.liked_by]
        return []
