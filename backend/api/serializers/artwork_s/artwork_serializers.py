from rest_framework import serializers
from api.models.artwork_model.artwork import Art
from datetime import datetime
from api.models.interaction_model.interaction import Like
import cloudinary.uploader
from api.utils.content_moderation import moderate_image
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from api.models.payment_model.payment_accounts import PaymentAccount

class ArtSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=100)
    artist = serializers.SerializerMethodField()
    category = serializers.CharField(max_length=100)
    medium = serializers.CharField(max_length=100)
    art_status = serializers.CharField(max_length=100)
    price = serializers.IntegerField()
    discounted_price = serializers.IntegerField(required=False, allow_null=True)  
    edition_type = serializers.CharField(source="edition", required=False)

    size = serializers.CharField(max_length=100, required=False)
    description = serializers.CharField(required=False)
    visibility = serializers.CharField(max_length=100, required=False, default="public")
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    edition = serializers.CharField(max_length=50, required=False)
    year_created = serializers.CharField(max_length=10, required=False)
    quantity = serializers.IntegerField(required=False, allow_null=True)


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
    default_paypal_email = serializers.SerializerMethodField() 
    
    def get_default_paypal_email(self, obj):
        """
        Returns the default PayPal account email for the artist, if exists
        """
        if not obj.artist:
            return None
        try:
            account = PaymentAccount.objects.get(
                user=obj.artist,
                type="paypal",
                is_default=True
            )
            return account.account_info
        except PaymentAccount.DoesNotExist:
            return None
        
    def get_likes_count(self, obj):
        return Like.objects.filter(art=obj).count()

    def validate(self, data):
        price = data.get("price")
        discounted_price = data.get("discounted_price")
        edition = data.get("edition", "").strip()
        quantity = data.get("quantity", None)

     
        if discounted_price is not None and discounted_price >= price:
            raise ValidationError("Discounted price must be less than the original price.")

       
        if edition == "Open Edition":
            if quantity is None:
                raise ValidationError("Quantity is required for Open Edition.")
            if quantity <= 0:
                raise ValidationError("Quantity must be a positive number.")
        else:
      
            data["quantity"] = None

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
        # --------------------------
        # 1. Handle new images
        # --------------------------
        images = validated_data.pop("images", [])
        if images:
            uploaded_urls = []
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
                    uploaded_urls.append(image_url)
                except Exception as e:
                    raise ValidationError({"cloudinary": f"Upload failed: {str(e)}"})
  
            instance.image_url = uploaded_urls


        for field in [
            "title", "category", "medium", "art_status", "price", "discounted_price",
            "size", "description", "visibility", "edition", "year_created"
        ]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        if instance.art_status.lower() == "active":
            if any(validated_data.get(f) is not None for f in ["price", "quantity", "edition"]):
                instance.art_status = "onSale"
 
        elif instance.art_status.lower() == "onsale":
            pass


        if "size" not in validated_data:
            height = validated_data.get("height")
            width = validated_data.get("width")
            if height and width:
                instance.size = f"{height}x{width}"

        instance.updated_at = datetime.utcnow()
        instance.save()
        return instance

    def get_artist(self, obj):
        try:
            if obj.artist:
                return {
                    "id": str(obj.artist.id),
                    "name": f"{obj.artist.first_name} {obj.artist.last_name}",
                    "profile_picture": str(obj.artist.profile_picture) if obj.artist.profile_picture else ""
                }
            return None
        except Exception as e:
            return None

    def to_representation(self, instance):
        artist_data = self.get_artist(instance) or {}

        return {
            "id": str(instance.id),
            "title": instance.title,
            "artist_id": str(artist_data.get("id", "")),
            "profile_picture": str(artist_data.get("profile_picture", "")),  
            "artist": str(artist_data.get("name", "")),
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
            "default_paypal_email": self.get_default_paypal_email(instance),
            **({"quantity": instance.quantity} if instance.edition == "Open Edition" else {}),
        }



class LightweightArtSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    artist = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    default_paypal_email = serializers.SerializerMethodField()

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

    def get_default_paypal_email(self, obj):
        if not obj.artist:
            return None
        try:
            account = PaymentAccount.objects.get(
                user=obj.artist,
                type="paypal",
                is_default=True
            )
            return account.account_info
        except PaymentAccount.DoesNotExist:
            return None


class ArtCardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    price = serializers.IntegerField()
    discounted_price = serializers.IntegerField(required=False, allow_null=True)
    description = serializers.SerializerMethodField()
    quantity= serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    visibility=serializers.SerializerMethodField()
    art_status=serializers.SerializerMethodField()
    edition=serializers.SerializerMethodField()
    artist = serializers.SerializerMethodField()
    artist_id = serializers.SerializerMethodField()
    medium = serializers.SerializerMethodField() 
    size=serializers.SerializerMethodField()
    year_created=serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    default_paypal_email = serializers.SerializerMethodField() 

    def get_average_rating(self, obj):
            from api.models.review_model.review import Review
            reviews = Review.objects(artwork=obj)
            if not reviews:
                return 0
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
    def get_total_ratings(self, obj):
        return Like.objects.filter(art=obj).count()

    def get_visibility(self, obj):
        return str(obj.visibility).lower() if hasattr(obj, "visibility") and obj.visibility else ""

    def get_art_status(self, obj):
        return str(obj.art_status).lower() if hasattr(obj, "art_status") and obj.art_status else ""

    def get_image_url(self, obj):
      
        try:
            if hasattr(obj, "image_url"):
                if isinstance(obj.image_url, str):
                    return [obj.image_url]  
                if isinstance(obj.image_url, list):
                    return obj.image_url
            return []
        except Exception as e:
            print(f"Error in get_image_url for art {obj.id}: {e}")
            return []


    def get_artist(self, obj):
        if obj.artist:
            return f"{obj.artist.first_name} {obj.artist.last_name}"
        return "Unknown"
    def get_artist_id(self, obj):
        if obj.artist:
            return str(obj.artist.id) 
        return None
    
    def get_profile_picture(self, obj):  
        if obj.artist and obj.artist.profile_picture:
            return str(obj.artist.profile_picture)
        return ""

    def get_category(self, obj):
        try:
            return str(obj.category) if obj.category is not None else ""
        except Exception as e:
            print(f" Error in get_category for art {obj.id}: {e}")
            return ""

    def get_edition(self, obj):
        try:
            return str(obj.edition) if hasattr(obj, "edition") and obj.edition else ""
        except Exception as e:
            print(f" Error in get_edition for art {obj.id}: {e}")
            return ""
        
    def get_size(self, obj):
        try:
            return str(obj.size) if hasattr(obj, "size") and obj.size else ""
        except Exception as e:
            print(f" Error in get_size for art {obj.id}: {e}")
            return ""
        
    def get_medium(self, obj):
        try:
            return str(obj.medium) if hasattr(obj, "medium") else ""
        except Exception as e:
            print(f"Error in get_medium for art {obj.id}: {e}")
            return ""
        
    def get_year_created(self, obj):
        try:
            return str(obj.year_created) if hasattr(obj, "year_created") else ""
        except Exception as e:
            print(f"Error in get_year_created for art {obj.id}: {e}")
            return ""
         
    def get_description(self, obj):
        try:
            if hasattr(obj, "description") and obj.description:
                return str(obj.description)
            return ""
        except Exception as e:
            print(f"Error in get_description for art {obj.id}: {e}")
            return ""
    def get_quantity(self, obj):
        try:
            
            if hasattr(obj, "quantity") and obj.quantity is not None:
                return obj.quantity
            
            return 1
        except Exception as e:
            print(f"Error in get_quantity for art {obj.id}: {e}")
            return 1
    
    def get_default_paypal_email(self, obj):
        if not obj.artist:
            return None
        try:
            account = PaymentAccount.objects.get(
                user=obj.artist,
                type="paypal",
                is_default=True
            )
            return account.account_info
        except PaymentAccount.DoesNotExist:
            return None
        
    def to_representation(self, instance):
        try:
            rep = super().to_representation(instance)
            return rep
        except Exception as e:
            print(" Error serializing art:", instance.id)
            print("Reason:", e)
            raise e
