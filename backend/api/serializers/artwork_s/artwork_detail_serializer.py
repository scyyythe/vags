
from rest_framework import serializers
from api.models.artwork_model.artwork import Art
from api.models.interaction_model.interaction import Like

class ArtistMiniSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.SerializerMethodField()
    profile_picture = serializers.CharField()

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}" if obj else ""

class ArtDetailSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    price = serializers.IntegerField()
    discounted_price = serializers.IntegerField(required=False, allow_null=True)
    edition = serializers.CharField(required=False)
    size = serializers.CharField(required=False)
    medium = serializers.CharField(required=False)
    artwork_style = serializers.CharField(source="category", required=False)
    year_created = serializers.CharField(required=False)
    visibility = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    
    artist = ArtistMiniSerializer(source="artist", read_only=True)
    image_urls = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    rating = serializers.FloatField(required=False)
    total_reviews = serializers.IntegerField(required=False)
    review_breakdown = serializers.DictField(child=serializers.IntegerField(), required=False)

    def get_image_urls(self, obj):
        urls = obj.image_url
        if isinstance(urls, str):
            return [urls]
        if isinstance(urls, list):
            return urls
        return []

    def get_likes_count(self, obj):
        return Like.objects.filter(art=obj).count()
