from rest_framework import serializers
from api.models.exhibit_model.exhibit import Exhibit
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
import cloudinary.uploader
from datetime import datetime
from api.models.interaction_model.interaction import Like
class ExhibitSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    banner = serializers.ImageField(required=False, allow_null=True)  
    owner = serializers.CharField()
    exhibit_type = serializers.ChoiceField(choices=['Solo', 'Collaborative'], required=False, allow_null=True)
    collaborators = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    artworks = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    visibility = serializers.ChoiceField(choices=['Public', 'Private', 'Pending'], default='Pending')
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    chosen_env = serializers.IntegerField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    viewed_by = serializers.ListField(child=serializers.CharField(), required=False, default=[])

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

    def upload_banner(self, banner_file):
        if banner_file:
            upload_result = cloudinary.uploader.upload(banner_file)
            return upload_result.get("secure_url", "")
        return ""

    def create(self, validated_data):
        banner_file = validated_data.pop("banner", None)
        if banner_file:
            validated_data["banner"] = self.upload_banner(banner_file)
        else:
            validated_data["banner"] = ""

        owner_id = validated_data.pop("owner")
        collaborators_ids = validated_data.pop("collaborators", [])
        artworks_ids = validated_data.pop("artworks", [])
        viewed_by_ids = validated_data.pop("viewed_by", [])

        validated_data["owner"] = User.objects.get(id=owner_id)
        validated_data["collaborators"] = [User.objects.get(id=uid) for uid in collaborators_ids]
        validated_data["artworks"] = [Art.objects.get(id=aid) for aid in artworks_ids]
        validated_data["viewed_by"] = [User.objects.get(id=uid) for uid in viewed_by_ids]

        exhibit = Exhibit(**validated_data)
        exhibit.save()
        return exhibit

    def update(self, instance, validated_data):
        banner_file = validated_data.pop("banner", None)
        if banner_file:
            instance.banner = self.upload_banner(banner_file)

        if "owner" in validated_data:
            instance.owner = User.objects.get(id=validated_data.pop("owner"))

        if "collaborators" in validated_data:
            collaborators_ids = validated_data.pop("collaborators")
            instance.collaborators = [User.objects.get(id=uid) for uid in collaborators_ids]

        if "artworks" in validated_data:
            artworks_ids = validated_data.pop("artworks")
            instance.artworks = [Art.objects.get(id=aid) for aid in artworks_ids]

        if "viewed_by" in validated_data:
            viewed_by_ids = validated_data.pop("viewed_by")
            instance.viewed_by = [User.objects.get(id=uid) for uid in viewed_by_ids]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.updated_at = datetime.utcnow()
        instance.save()
        return instance

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "title": instance.title,
            "description": instance.description,
            "tags": instance.tags,
            "banner": instance.banner,
            "owner": str(instance.owner.id) if instance.owner else None,
            "exhibit_type": instance.exhibit_type,
            "collaborators": [str(u.id) for u in instance.collaborators],
            "artworks": [str(a.id) for a in instance.artworks],
            "category": instance.category,
            "visibility": instance.visibility,
            "start_time": instance.start_time,
            "end_time": instance.end_time,
            "chosen_env": instance.chosen_env,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "viewed_by": [str(u.id) for u in instance.viewed_by],
            "exhibit_likes_count": self.get_exhibit_likes_count(instance),
            "user_has_liked_exhibit": self.get_user_has_liked_exhibit(instance),

        }