from rest_framework import serializers
from api.models.artwork_model.artwork import Art
from datetime import datetime
from api.models.interaction_model.interaction import Comment, Like
from api.models.interaction_model.notification import Notification
import cloudinary.uploader
from api.utils.content_moderation import moderate_image
from rest_framework.exceptions import ValidationError

class ArtSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=100)
    artist = serializers.SerializerMethodField()
    category = serializers.CharField(max_length=100)
    medium = serializers.CharField(max_length=100)
    art_status = serializers.CharField(max_length=100)
    price = serializers.IntegerField()
    size=serializers.CharField(max_length=100, required=False)
    description = serializers.CharField(required=False)
    visibility = serializers.CharField(max_length=100, required=False, default="public")  
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField(required=False)  

    likes_count = serializers.SerializerMethodField()

    def get_likes_count(self, obj):
      
        return Like.objects.filter(art=obj).count()

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        if image:
            result = cloudinary.uploader.upload(image)
            image_url = result.get('secure_url', '')
            
            
            if not moderate_image(image_url):
                raise ValidationError("Image contains inappropriate content and was rejected.")
            
            validated_data['image_url'] = image_url
        else:
            validated_data['image_url'] = ''

        if "visibility" not in validated_data:
            validated_data["visibility"] = "Public"

        art = Art(**validated_data)
        art.save()
        return art

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        if image:
            result = cloudinary.uploader.upload(image)
            image_url = result.get('secure_url', '')

            
            if not moderate_image(image_url):
                raise ValidationError("Image contains inappropriate content.")

            validated_data['image_url'] = image_url

       
        instance.title = validated_data.get("title", instance.title)
        instance.category = validated_data.get("category", instance.category)
        instance.medium = validated_data.get("medium", instance.medium)
        instance.art_status = validated_data.get("art_status", instance.art_status)
        instance.price = validated_data.get("price", instance.price)
        instance.size = validated_data.get("size", instance.size)
        instance.description = validated_data.get("description", instance.description)
        instance.visibility = validated_data.get("visibility", instance.visibility)

        if 'image_url' in validated_data:
            instance.image_url = validated_data['image_url']
        instance.updated_at = datetime.utcnow() 
        instance.save()
        return instance


    def to_representation(self, instance):
        artist_id = None
        artist_name = None
        profile_picture = None

        if instance.artist:
            artist_id = str(instance.artist.id)
            profile_picture = str(instance.artist.profile_picture)  
            artist_name = f"{instance.artist.first_name} {instance.artist.last_name}"

        return {
            "id": str(instance.id),
            "title": instance.title,
            "artist_id": artist_id,
            "profile_picture": profile_picture,
            "artist": artist_name,
            "category": instance.category,  
            "medium": instance.medium,
            "art_status": instance.art_status,
            "price": instance.price,
            "size": instance.size,
            "description": instance.description,
            "visibility": instance.visibility,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "image_url": instance.image_url,
            "likes_count": self.get_likes_count(instance),
        }

