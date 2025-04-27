
from rest_framework import serializers
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User 
from api.models.interaction_model.interaction import Comment,Like,CartItem,Saved 
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.serializers.user_s.users_serializers import UserSerializer

class CommentSerializer(serializers.Serializer):
    id = serializers.CharField()
    content = serializers.CharField()
    user = UserSerializer(read_only=True)  
    art = serializers.CharField(write_only=True)  
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        user = self.context['request'].user  
        art_id = validated_data.get('art')  
        
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            raise serializers.ValidationError("Artwork not found")

        comment = Comment.objects.create(
            content=validated_data['content'],
            user=user,
            art=art
        )
        return comment
    

class LikeSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)
    art = serializers.CharField(write_only=True) 
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
      
        user = validated_data.get('user')
        art_id = validated_data.get('art')
        art = Art.objects.get(id=art_id)  

        like = Like(user=user, art=art)
        like.save()
        return like
    
class SavedSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True) 
    art = serializers.CharField(write_only=True) 
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
      
        user = validated_data.get('user')
        art_id = validated_data.get('art')
        art = Art.objects.get(id=art_id)  

        saved = Saved(user=user, art=art)
        saved.save()
        return saved

class CartItemSerializer(serializers.Serializer):
    user = serializers.CharField(read_only=True)  
    art = ArtSerializer(read_only=True)
    quantity = serializers.IntegerField(default=1)  
    added_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        user = validated_data.get('user')  
        art_id = validated_data.get('art')  
        art = Art.objects.get(id=art_id)  
        quantity = validated_data.get('quantity', 1) 
        try:
            cart_item = CartItem.objects.get(user=user, art=art) 
            cart_item.quantity += quantity 
            cart_item.save()  
        except CartItem.DoesNotExist:   
            cart_item = CartItem(user=user, art=art, quantity=quantity)
            cart_item.save()  
        
        return cart_item

    def update(self, instance, validated_data):
        
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.save()
        return instance