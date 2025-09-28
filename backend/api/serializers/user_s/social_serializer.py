from rest_framework import serializers
from api.models.user_model.social_model import Social

class SocialSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    platform = serializers.ChoiceField(choices=["facebook", "twitter", "instagram", "linkedin", "youtube", "tiktok", "github", "other"])
    url = serializers.URLField()
    added_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Social.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.platform = validated_data.get("platform", instance.platform)
        instance.url = validated_data.get("url", instance.url)
        instance.save()
        return instance

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "platform": instance.platform,
            "url": instance.url,
            "added_at": instance.added_at
        }
