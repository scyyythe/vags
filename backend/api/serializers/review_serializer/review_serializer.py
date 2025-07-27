from rest_framework import serializers
from bson import ObjectId
import cloudinary.uploader
from rest_framework.exceptions import ValidationError
from api.utils.content_moderation import moderate_image  
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
