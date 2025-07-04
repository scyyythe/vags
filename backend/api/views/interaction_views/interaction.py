from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.models.exhibit_model.exhibit import Exhibit
from api.serializers.exhibit_s.exhibit_seriliazers import ExhibitSerializer
from api.models.artwork_model.artwork import Art
from api.models.artwork_model.bid import Auction
from api.models.interaction_model.interaction import Comment, Like, CartItem, Saved
from api.serializers.interaction_s.interaction import CommentSerializer, LikeSerializer, CartItemSerializer,SavedSerializer
from api.models.interaction_model.notification import Notification
from rest_framework import generics, permissions
from datetime import datetime
from django.utils.timesince import timesince
from api.serializers.artwork_s.artwork_serializers import ArtSerializer

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
        now = datetime.now()
        time_elapsed = timesince(art.created_at, now) 
        artist=art.artist
        message = f"{user.first_name} commented on your artwork '{art.title}'"
        Notification.objects.create(
            user=artist, 
            message=f"{user.first_name} commented on {art.title}",
            art=art,  
            name=user.first_name,  
            action="commented on",  
            target=art.title,  
            icon="project",  
            time=time_elapsed, 
            date=datetime.now(), 
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

class CommentListView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request, art_id, *args, **kwargs):
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        comments = Comment.objects.filter(art=art).order_by('-created_at')
        comment_serializer = CommentSerializer(comments, many=True)
        return Response({
            "artwork": art.title,
            "comments": comment_serializer.data
        }, status=status.HTTP_200_OK)
        
class LikeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        art_id = kwargs.get("art_id")
        auction_id = kwargs.get("auction_id")
        exhibit_id = kwargs.get("exhibit_id")

 
        if art_id:
            try:
                art = Art.objects.get(id=art_id)
            except Art.DoesNotExist:
                return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

            like = Like.objects.filter(user=user, art=art).first()
            if like:
                like.delete()
                like_count = Like.objects.filter(art=art).count()
                return Response({
                    "is_liked": False,
                    "like_count": like_count,
                    "detail": "You have unliked this artwork."
                }, status=status.HTTP_200_OK)
            else:
                Like.objects.create(user=user, art=art)
                Notification.objects.create(
                    user=art.artist,
                    actor=user,
                    message=f" liked your artwork '{art.title}'",
                    art=art,
                    name=f"{user.first_name} {user.last_name}",
                    action="liked your artwork",
                    target=art.title,
                    icon="like",
                    created_at=datetime.now(),
                    link=f"/artwork/{art.id}",
                )
                like_count = Like.objects.filter(art=art).count()
                return Response({
                    "is_liked": True,
                    "like_count": like_count,
                    "detail": "You liked this artwork."
                }, status=status.HTTP_201_CREATED)


        elif auction_id:
            try:
                auction = Auction.objects.get(id=auction_id)
            except Auction.DoesNotExist:
                return Response({"detail": "Auction not found."}, status=status.HTTP_404_NOT_FOUND)

            like = Like.objects.filter(user=user, auction=auction).first()
            if like:
                like.delete()
                like_count = Like.objects.filter(auction=auction).count()
                return Response({
                    "is_liked": False,
                    "like_count": like_count,
                    "detail": "You unliked this auction."
                }, status=status.HTTP_200_OK)
            else:
                Like.objects.create(user=user, auction=auction)
                Notification.objects.create(
                    user=auction.artwork.artist,
                    actor=user,
                    message=f" liked your auction '{auction.artwork.title}'",
                    auction=auction,
                    name=f"{user.first_name} {user.last_name}",
                    action="liked your auction",
                    target=auction.artwork.title,
                    icon="like",
                    created_at=datetime.now(),
                    link=f"/bid/{auction.id}/",
                )
                like_count = Like.objects.filter(auction=auction).count()
                return Response({
                    "is_liked": True,
                    "like_count": like_count,
                    "detail": "You liked this auction."
                }, status=status.HTTP_201_CREATED)


        elif exhibit_id:
            try:
                exhibit = Exhibit.objects.get(id=exhibit_id)
            except Exhibit.DoesNotExist:
                return Response({"detail": "Exhibit not found."}, status=status.HTTP_404_NOT_FOUND)

            like = Like.objects.filter(user=user, exhibit=exhibit).first()
            if like:
                like.delete()
                like_count = Like.objects.filter(exhibit=exhibit).count()
                return Response({
                    "is_liked": False,
                    "like_count": like_count,
                    "detail": "You unliked this exhibit."
                }, status=status.HTTP_200_OK)
            else:
                Like.objects.create(user=user, exhibit=exhibit)
                Notification.objects.create(
                    user=exhibit.owner,
                    actor=user,
                    message=f" liked your exhibit '{exhibit.title}'",
                    exhibit=exhibit,
                    name=f"{user.first_name} {user.last_name}",
                    action="liked your exhibit",
                    target=exhibit.title,
                    icon="like",
                    created_at=datetime.now(),
                    link=f"/exhibit/{exhibit.id}/",
                )
                like_count = Like.objects.filter(exhibit=exhibit).count()
                return Response({
                    "is_liked": True,
                    "like_count": like_count,
                    "detail": "You liked this exhibit."
                }, status=status.HTTP_201_CREATED)

   
        else:
            return Response({"detail": "No valid target specified."}, status=status.HTTP_400_BAD_REQUEST)

        
class LikeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, art_id, *args, **kwargs):
       
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        likes = Like.objects.filter(art=art).only('user', 'created_at').order_by('-created_at')
        like_serializer = LikeSerializer(likes, many=True)
        like_count = likes.count()
        return Response({
            "artwork": art.title,
            "like_count": like_count,
            "likes": like_serializer.data
        }, status=status.HTTP_200_OK)
    
class LikeStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, art_id, *args, **kwargs):
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        is_liked = Like.objects.filter(art=art, user=request.user).first() is not None

        return Response({
            "isLiked": is_liked,
        }, status=status.HTTP_200_OK)



class SavedCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        art_id = kwargs.get('art_id') 

        if not art_id:
            return Response({"detail": "Art ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            art = Art.objects.get(id=art_id)  
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        saved = Saved.objects.filter(user=user, art=art).first()

        if saved:
            saved.delete()  
            return Response({"detail": "You have unsaved this artwork."}, status=status.HTTP_200_OK)
        
        else:
            now = datetime.now()
            time_elapsed = timesince(art.created_at, now)
            saved = Saved.objects.create(user=user, art=art) 
            artist = art.artist
            message = f"{user.first_name} saved your artwork '{art.title}'"
            return Response(SavedSerializer(saved).data, status=status.HTTP_201_CREATED)
class SavedArtworksListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        saved_entries = Saved.objects.filter(user=user)
        artworks = [entry.art for entry in saved_entries if entry.art is not None]

        serializer = ArtSerializer(artworks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

        
class SavedListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, art_id, *args, **kwargs):
       
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        saved = Saved.objects.filter(art=art).only('user', 'created_at').order_by('-created_at')
        saved_serializer = SavedSerializer(saved, many=True)
        saved_count = saved.count()
        return Response({
            "artwork": art.title,
            "saved_count": saved_count,
            "saved": saved_serializer.data
        }, status=status.HTTP_200_OK)

class SavedStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, art_id, *args, **kwargs):
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        is_saved = Saved.objects.filter(art=art, user=request.user).count() > 0

        return Response({
            "isSaved": is_saved,
        }, status=status.HTTP_200_OK)
    from rest_framework import generics


class ArtworkStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, art_id, *args, **kwargs):
        try:
          
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"detail": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

       
        is_saved = Saved.objects.filter(art=art, user=request.user).count() > 0
        
      
        is_liked = Like.objects.filter(art=art, user=request.user).first() is not None

       
        return Response({
            "isSaved": is_saved,
            "isLiked": is_liked,
        }, status=status.HTTP_200_OK)

class ArtworkBulkStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        artwork_ids_param = request.query_params.get("artwork_ids", "")
        if not artwork_ids_param:
            return Response({"detail": "No artwork IDs provided."}, status=400)

        artwork_ids = artwork_ids_param.split(",")

        artworks = Art.objects(id__in=artwork_ids)  #
        status_data = []

        for art in artworks:
            is_saved = Saved.objects(art=art, user=request.user).count() > 0
            is_liked = Like.objects(art=art, user=request.user).count() > 0

            status_data.append({
                "artwork_id": str(art.id),
                "isSaved": is_saved,
                "isLiked": is_liked,
            })

        return Response(status_data, status=200)

        
                        
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