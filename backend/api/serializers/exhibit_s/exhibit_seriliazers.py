from rest_framework import serializers
from api.models.exhibit_model.exhibit import Exhibit
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
import cloudinary.uploader
from datetime import datetime

class ExhibitSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    images = serializers.ListField(child=serializers.ImageField(), required=True)

    owner = serializers.CharField()
    collaborators = serializers.ListField(child=serializers.CharField(), required=False)
    artworks = serializers.ListField(child=serializers.CharField(), required=False)

    visibility = serializers.ChoiceField(choices=['public', 'private'], default='private')
    is_published = serializers.BooleanField(default=False)
    preview_mode = serializers.BooleanField(default=True)
    scheduled_at = serializers.DateTimeField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        image_files = validated_data.pop("images", [])
        image_urls = []

        for img in image_files:
            uploaded = cloudinary.uploader.upload(img)
            image_urls.append(uploaded.get("secure_url", ""))

        validated_data["images"] = image_urls
        validated_data["owner"] = User.objects.get(id=validated_data["owner"])
        validated_data["collaborators"] = [User.objects.get(id=uid) for uid in validated_data.get("collaborators", [])]
        validated_data["artworks"] = [Art.objects.get(id=aid) for aid in validated_data.get("artworks", [])]

        exhibit = Exhibit(**validated_data)
        exhibit.save()
        return exhibit

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "title": instance.title,
            "description": instance.description,
            "tags": instance.tags,
            "images": [str(img) for img in instance.images],
            "owner": str(instance.owner.id),
            "collaborators": [str(u.id) for u in instance.collaborators],
            "artworks": [str(a.id) for a in instance.artworks],
            "visibility": instance.visibility,
            "is_published": instance.is_published,
            "preview_mode": instance.preview_mode,
            "scheduled_at": instance.scheduled_at,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }


