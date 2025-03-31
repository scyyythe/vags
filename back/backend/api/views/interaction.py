from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.models.artwork import Art
from api.models.interaction import Comment, Like, CartItem
from api.serializers.interaction import CommentSerializer, LikeSerializer, CartItemSerializer

class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request, *args, **kwargs):
        user = request.user  
        art_id = request.data.get('art') 
        content = request.data.get('content')  

        if not art_id or not content:
            return Response({"detail": "Art ID and content are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            art = Art.objects.get(id=art_id)  
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

       
        comment = Comment.objects.create(content=content, user=user, art=art)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class LikeCreateView(APIView):
    permission_classes = [IsAuthenticated]  
    
    def post(self, request, *args, **kwargs):
        user = request.user
        art_id = request.data.get('art')  

        if not art_id:
            return Response({"detail": "Art ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            art = Art.objects.get(id=art_id)  
            
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        like = Like.objects.filter(user=user, art=art).first()

        if like:
            like.delete()
            return Response({"detail": "You have unliked this artwork."}, status=status.HTTP_200_OK)
        
        else:
            like = Like.objects.create(user=user, art=art)
            return Response(LikeSerializer(like).data, status=status.HTTP_201_CREATED)
        
class CartItemCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        art_id = request.data.get('art')
        quantity = request.data.get('quantity', 1)

        if not art_id:
            return Response({"detail": "Art ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        cart_item = CartItemSerializer.create(self, validated_data={'user': user, 'art': art_id, 'quantity': quantity})
        
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
    
    

class CartItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        art_id = request.data.get('art')

        if not art_id:
            return Response({"detail": "Art ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        cart_item = CartItem.objects.filter(user=user, art=art).first()

        if not cart_item:
            return Response({"detail": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response({"detail": "Item removed from the cart."}, status=status.HTTP_200_OK)
    

class CartRetrieveView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request, *args, **kwargs):
        user = request.user 
        cart_items = CartItem.objects.filter(user=user)

        if cart_items.count() == 0:
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_404_NOT_FOUND)

       
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)