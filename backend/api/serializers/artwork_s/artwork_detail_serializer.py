from rest_framework import serializers
from api.models.artwork_model.artwork import Art
from api.models.interaction_model.interaction import Like
from api.models.user_model.users import User
import traceback


class ArtistMiniSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    def get_id(self, obj):
        try:
            return str(obj.id)
        except Exception as e:
            print("❌ Error in get_id():", e)
            traceback.print_exc()
            return None

    def get_name(self, obj):
        try:
            if isinstance(obj, dict):
                return f"{obj.get('first_name', '')} {obj.get('last_name', '')}"
            return f"{obj.first_name} {obj.last_name}"
        except Exception as e:
            print("❌ Error in get_name():", e)
            traceback.print_exc()
            return "Unknown Artist"

    def get_profile_picture(self, obj):
        try:
            if isinstance(obj, dict):
                return obj.get("profile_picture", None)
            return obj.profile_picture
        except Exception as e:
            print("❌ Error in get_profile_picture():", e)
            traceback.print_exc()
            return None


class ArtDetailSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    price = serializers.IntegerField()
    discounted_price = serializers.IntegerField(required=False, allow_null=True)
    edition = serializers.CharField(required=False, allow_blank=True)
    size = serializers.CharField(required=False, allow_blank=True)
    medium = serializers.CharField(required=False, allow_blank=True)
    artwork_style = serializers.CharField(source="category", required=False, allow_blank=True)
    year_created = serializers.CharField(required=False, allow_blank=True)
    visibility = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()

    artist = ArtistMiniSerializer(read_only=True)  # ✅ removed `source="artist"`
    image_urls = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    rating = serializers.FloatField(required=False)
    total_reviews = serializers.IntegerField(required=False)
    review_breakdown = serializers.DictField(child=serializers.IntegerField(), required=False)

    def get_image_urls(self, obj):
        try:
            print("📸 image_url raw:", obj.image_url)
            urls = obj.image_url
            if isinstance(urls, str):
                return [urls]
            elif isinstance(urls, list):
                return urls
            else:
                print("⚠️ image_url is neither string nor list:", type(urls))
        except Exception as e:
            print("❌ Error in get_image_urls():", e)
            import traceback
            traceback.print_exc()
        return []

    def get_likes_count(self, obj):
        try:
            return Like.objects.filter(art=obj).count()
        except Exception as e:
            print("❌ Error in get_likes_count():", e)
            import traceback
            traceback.print_exc()
            return 0

    def to_representation(self, instance):
        try:
            print("🧩 Serializing Art object:", instance.title)
            return super().to_representation(instance)
        except Exception as e:
            print("❌ Error in ArtDetailSerializer.to_representation():", e)
            traceback.print_exc()
            return {}

