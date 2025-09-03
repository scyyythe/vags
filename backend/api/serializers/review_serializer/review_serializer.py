from rest_framework import serializers
from bson import ObjectId
import cloudinary.uploader
from rest_framework.exceptions import ValidationError
from api.utils.content_moderation import moderate_image  
from api.models.review_model.review import Review
class ReviewSerializer(serializers.Serializer):
    artwork_id = serializers.CharField()
    purchase_id = serializers.CharField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(allow_blank=True)
    photos = serializers.ListField(
        child=serializers.URLField(), 
        required=False
    )

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        from bson import ObjectId
        from api.models.review_model.review import Review
        from api.models.artwork_model.artwork import Art
        from api.models.purchase_model.order import PurchasedArtwork

        try:
            artwork = Art.objects.get(id=ObjectId(validated_data["artwork_id"]))
        except Art.DoesNotExist:
            raise serializers.ValidationError("Artwork not found.")

        try:
            purchase = PurchasedArtwork.objects.get(id=ObjectId(validated_data["purchase_id"]))
        except PurchasedArtwork.DoesNotExist:
            raise serializers.ValidationError("Purchase not found.")

        if Review.objects(purchase=purchase).first():
            raise serializers.ValidationError("You have already reviewed this purchase.")

        uploaded_urls = validated_data.pop("photos", [])  

        review = Review.objects.create(
            reviewer=user,
            artwork=artwork,
            purchase=purchase,
            rating=validated_data["rating"],
            comment=validated_data.get("comment", ""),
            photos=uploaded_urls
        )
        
        purchase.status = "Reviewed"
        purchase.save()

        return review
    
    
class ReviewUpdateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(allow_blank=True)
    photos = serializers.ListField(
        child=serializers.URLField(), 
        required=False
    )
from rest_framework import serializers
from bson import ObjectId
import cloudinary.uploader
from rest_framework.exceptions import ValidationError
from api.utils.content_moderation import moderate_image  
from api.models.review_model.review import Review
class ReviewSerializer(serializers.Serializer):
    artwork_id = serializers.CharField()
    purchase_id = serializers.CharField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(allow_blank=True)
    photos = serializers.ListField(
        child=serializers.URLField(), 
        required=False
    )

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        from bson import ObjectId
        from api.models.review_model.review import Review
        from api.models.artwork_model.artwork import Art
        from api.models.purchase_model.order import PurchasedArtwork

        try:
            artwork = Art.objects.get(id=ObjectId(validated_data["artwork_id"]))
        except Art.DoesNotExist:
            raise serializers.ValidationError("Artwork not found.")

        try:
            purchase = PurchasedArtwork.objects.get(id=ObjectId(validated_data["purchase_id"]))
        except PurchasedArtwork.DoesNotExist:
            raise serializers.ValidationError("Purchase not found.")

        if Review.objects(purchase=purchase).first():
            raise serializers.ValidationError("You have already reviewed this purchase.")

        uploaded_urls = validated_data.pop("photos", [])  

        review = Review.objects.create(
            reviewer=user,
            artwork=artwork,
            purchase=purchase,
            rating=validated_data["rating"],
            comment=validated_data.get("comment", ""),
            photos=uploaded_urls
        )
        
        purchase.status = "Reviewed"
        purchase.save()

        return review
    
    
class ReviewUpdateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(allow_blank=True)
    photos = serializers.ListField(
        child=serializers.URLField(), 
        required=False
    )

class ReviewReadSerializer(serializers.Serializer):
    id = serializers.CharField(source="pk")
    user = serializers.SerializerMethodField()
    score = serializers.FloatField(source="rating") 
    comment = serializers.CharField()
    created_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S.%fZ") 
    verified = serializers.SerializerMethodField()
    images = serializers.ListField(source="photos")


    def get_user(self, obj: Review):
        reviewer = obj.reviewer
        if not reviewer:
            return {"first_name": "Anonymous", "last_name": "", "profile_picture": None}
        return {
            "first_name": getattr(reviewer, "first_name", "Anonymous"),
            "last_name": getattr(reviewer, "last_name", ""),
            "profile_picture": getattr(reviewer, "profile_picture", None),
        }

    def get_verified(self, obj: Review):
        return getattr(obj.reviewer, "is_verified", False)