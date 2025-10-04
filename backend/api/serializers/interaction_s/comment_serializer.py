from rest_framework import serializers

class CommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = serializers.CharField(read_only=True)
    text = serializers.CharField()
    likes = serializers.IntegerField(read_only=True)
    emoji_reactions = serializers.DictField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
