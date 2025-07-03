
from rest_framework import serializers

class TopSellerSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    avatar = serializers.CharField()
    rating = serializers.FloatField()
    art_count = serializers.IntegerField()
