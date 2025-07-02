from rest_framework import serializers
from api.models.artwork_model.artwork import Art
from datetime import datetime
from api.models.interaction_model.interaction import Like
import cloudinary.uploader
from api.utils.content_moderation import moderate_image
from rest_framework.exceptions import ValidationError
from rest_framework import serializers

class ArtSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=100)
    artist = serializers.SerializerMethodField()
    category = serializers.CharField(max_length=100)
    medium = serializers.CharField(max_length=100)
    art_status = serializers.CharField(max_length=100)
    price = serializers.IntegerField()
    discounted_price = serializers.IntegerField(required=False, allow_null=True)  # ✅ added here

    size = serializers.CharField(max_length=100, required=False)
    description = serializers.CharField(required=False)
    visibility = serializers.CharField(max_length=100, required=False, default="public")
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    edition = serializers.CharField(max_length=50, required=False)
    year_created = serializers.CharField(max_length=10, required=False)

    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )

    image_url = serializers.ListField(
        child=serializers.URLField(),
        read_only=True
    )

    likes_count = serializers.SerializerMethodField()

    def get_likes_count(self, obj):
        return Like.objects.filter(art=obj).count()

    def validate(self, data):
        price = data.get("price")
        discounted_price = data.get("discounted_price")

        if discounted_price is not None and discounted_price >= price:
            raise ValidationError("Discounted price must be less than the original price.")
        return data

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        if not isinstance(images, list):
            images = [images]

        uploaded_urls = []
        for img in images:
            try:
                result = cloudinary.uploader.unsigned_upload(
                    img,
                    upload_preset="user_artwork_uploads",
                    folder="artworks"
                )
                url = result.get("secure_url")
                if not moderate_image(url):
                    raise ValidationError("Inappropriate image content.")
                uploaded_urls.append(url)
            except Exception as e:
                raise ValidationError({"cloudinary": f"Upload failed: {str(e)}"})

        validated_data["image_url"] = uploaded_urls
        validated_data.setdefault("visibility", "Public")

        art = Art(**validated_data)
        art.save()
        return art


    def update(self, instance, validated_data):
        images = validated_data.pop("images", [])
        if images:
            for img in images:
                try:
                    result = cloudinary.uploader.unsigned_upload(
                        img,
                        upload_preset="user_artwork_uploads",
                        folder="artworks"
                    )
                    image_url = result.get("secure_url", "")
                    if not moderate_image(image_url):
                        raise ValidationError("One of the images was rejected.")
                    instance.image_url.append(image_url)
                except Exception as e:
                    raise ValidationError({"cloudinary": f"Upload failed: {str(e)}"})

        for field in [
            "title", "category", "medium", "art_status", "price", "discounted_price",
            "size", "description", "visibility", "edition", "year_created"
        ]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.updated_at = datetime.utcnow()
        instance.save()
        return instance


    def get_artist(self, obj):
        if obj.artist:
            return {
                "id": str(obj.artist.id),
                "name": f"{obj.artist.first_name} {obj.artist.last_name}",
                "profile_picture": str(obj.artist.profile_picture)
            }
        return None

    def to_representation(self, instance):
        artist_data = self.get_artist(instance)

        return {
            "id": str(instance.id),
            "title": instance.title,
            "artist_id": artist_data["id"] if artist_data else None,
            "profile_picture": artist_data["profile_picture"] if artist_data else None,
            "artist": artist_data["name"] if artist_data else None,
            "category": instance.category,
            "medium": instance.medium,
            "art_status": instance.art_status,
            "price": instance.price,
            "discounted_price": instance.discounted_price,  
            "size": instance.size,
            "description": instance.description,
            "visibility": instance.visibility,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "image_url": instance.image_url,
            "likes_count": self.get_likes_count(instance),
            "edition": instance.edition,
            "year_created": instance.year_created,
        }

class LightweightArtSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    artist = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    def get_artist(self, obj):
        if obj.artist:
            return {
                "name": f"{obj.artist.first_name} {obj.artist.last_name}",
                "profile_picture": str(obj.artist.profile_picture or "")
            }
        return {
            "name": "",
            "profile_picture": ""
        }

    def get_image_url(self, obj):
        if not hasattr(obj, "image_url"):
            return []

        urls = obj.image_url

        if isinstance(urls, str):
            return [urls]
        if isinstance(urls, list):
            return urls
        return []

    def get_likes_count(self, obj):
        return Like.objects.filter(art=obj).count()


class ArtCardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    price = serializers.IntegerField()
    discounted_price = serializers.IntegerField(required=False, allow_null=True)
    total_ratings = serializers.IntegerField(default=0)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if hasattr(obj, "image_url"):
            if isinstance(obj.image_url, str):
                return [obj.image_url]
            if isinstance(obj.image_url, list):
                return obj.image_url
        return []


