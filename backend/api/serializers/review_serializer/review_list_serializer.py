
from rest_framework import serializers

class ReviewListSerializer(serializers.Serializer):
    id = serializers.CharField(source="id")
    rating = serializers.IntegerField()
    comment = serializers.CharField()
    photos = serializers.ListField(child=serializers.URLField(), required=False)
    created_at = serializers.DateTimeField()
    reviewer_name = serializers.CharField(source="reviewer.username")
