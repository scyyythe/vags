from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.bid import Auction, AuctionStatus,Bid
from api.serializers.artwork_s.auction_light_serializer import LightweightAuctionCardSerializer
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from mongoengine.errors import DoesNotExist
from datetime import datetime
class LightweightAuctionListView(APIView):
    def get(self, request):
        try:
            page = int(request.GET.get("page", 1))
            limit = int(request.GET.get("limit", 10))
        except ValueError:
            return Response({"error": "Invalid page or limit."}, status=status.HTTP_400_BAD_REQUEST)

        skip = (page - 1) * limit

        # Get deactivated user IDs to exclude their content
        from api.models.user_model.users import User
        deactivated_user_ids = User.objects(user_status__iexact="deactivated").scalar('id')
        
        auctions = (
            Auction.objects(status=AuctionStatus.ON_GOING.value, visibility__ne="Deleted")
            .order_by("-created_at")
            .skip(skip)
            .limit(limit)
        )
        
        # Filter out auctions from deactivated users
        if deactivated_user_ids:
            from api.models.artwork_model.artwork import Art
            valid_artworks = Art.objects(artist__nin=deactivated_user_ids).only("id")
            valid_artwork_ids = [art.id for art in valid_artworks]
            auctions = auctions.filter(artwork__in=valid_artwork_ids)

        data = LightweightAuctionCardSerializer(auctions, many=True).data
        return Response(data, status=status.HTTP_200_OK)

class CloseAuctionViewNew(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, auction_id):
        from api.models.interaction_model.notification import Notification
        from django.utils.timezone import now as dj_now

        try:
            auction = Auction.objects.get(id=auction_id)
        except DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

     
        if str(auction.artwork.artist.id) != str(request.user.id):
            return Response(
                {"error": "You are not authorized to close this auction."},
                status=status.HTTP_403_FORBIDDEN,
            )

        auction.manual_close_auction()
        artwork = auction.artwork

       
        Notification.objects.create(
            user=artwork.artist,
            actor=request.user,
            message=f"You have manually closed the auction for '{artwork.title}'.",
            art=artwork,
            name=f"{request.user.first_name} {request.user.last_name}",
            action="closed the auction",
            target=artwork.title,
            icon="🔒",
            link=f"/bid/{auction.id}/",
            created_at=datetime.now(),
        )

  
        unique_bidders = {bid.bidder.id: bid.bidder for bid in auction.bid_history if bid.bidder}

        for bidder in unique_bidders.values():
            Notification.objects.create(
                user=bidder,
                actor=artwork.artist,
                message=f"The auction for '{artwork.title}' has been manually closed by the artist.",
                art=artwork,
                name=f"{artwork.artist.first_name} {artwork.artist.last_name}",
                action="closed the auction",
                target=artwork.title,
                icon="🔔",
                link=f"/bid/{auction.id}/",
                created_at=datetime.now(),
            )

        return Response({"message": "Auction manually closed and notifications sent."}, status=status.HTTP_200_OK)


class DeleteAuctionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, auction_id):
        try:
            auction = Auction.objects.get(id=auction_id)
        except DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

        
        if str(auction.artwork.artist.id) != str(request.user.id):
            return Response(
                {"error": "You are not authorized to delete this auction"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if auction is already deleted
        if auction.visibility == "Deleted":
            return Response(
                {"error": "This auction is already deleted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

       
        if auction.bid_history and len(auction.bid_history) > 0:
            return Response(
                {"error": "This auction has active bid history. Please close it first before deleting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Soft delete: Set visibility to "Deleted"
        auction.visibility = "Deleted"
        auction.updated_at = datetime.utcnow()
        auction.save()

        # Set artwork back to Active so it can be used for new auctions
        artwork = auction.artwork
        if isinstance(artwork.image_url, str):
            artwork.image_url = [artwork.image_url]
        elif artwork.image_url is None:
            artwork.image_url = []

        artwork.art_status = "Active"
        artwork.save()

        return Response({"message": "Auction moved to trash"}, status=status.HTTP_200_OK)


class RestoreAuctionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, auction_id):
        try:
            auction = Auction.objects.get(id=auction_id)
        except Auction.DoesNotExist:
            return Response({"detail": "Auction not found."}, status=status.HTTP_404_NOT_FOUND)

        if str(auction.artwork.artist.id) != str(request.user.id):
            return Response(
                {"detail": "Not authorized to restore this auction."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Restore the auction by setting visibility back to Public
        auction.visibility = "Public"
        auction.updated_at = datetime.utcnow()
        auction.save()

        return Response(
            {"detail": "Auction restored successfully."},
            status=status.HTTP_200_OK,
        )


class RestoreAllAuctionsView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user
            
            # First get all artwork IDs owned by the user
            from api.models.artwork_model.artwork import Art
            user_artworks = Art.objects(artist=user.id).only('id')
            artwork_ids = [art.id for art in user_artworks]
            
            # Get all deleted auctions for those artworks
            deleted_auctions = Auction.objects(
                artwork__in=artwork_ids,
                visibility="Deleted"
            )
            
            count = deleted_auctions.count()
            
            # Restore all deleted auctions
            for auction in deleted_auctions:
                auction.visibility = "Public"
                auction.updated_at = datetime.utcnow()
                auction.save()
            
            return Response(
                {"message": f"Successfully restored {count} auctions."},
                status=status.HTTP_200_OK,
            )
            
        except Exception as e:
            print("🔥 ERROR in RestoreAllAuctionsView:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
