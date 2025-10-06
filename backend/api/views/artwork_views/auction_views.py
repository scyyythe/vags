from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.bid import Auction, AuctionStatus,Bid
from api.serializers.artwork_s.auction_light_serializer import LightweightAuctionCardSerializer
from rest_framework import generics, status, permissions
from rest_framework.response import Response
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

        auctions = (
            Auction.objects(status=AuctionStatus.ON_GOING.value)
            .order_by("-created_at")
            .skip(skip)
            .limit(limit)
        )

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

       
        if auction.bid_history and len(auction.bid_history) > 0:
            return Response(
                {"error": "This auction has active bid history. Please close it first before deleting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        try:
            Bid.objects(artwork=auction.artwork).delete()
        except Exception as e:
            print(f"Warning: Failed to clean bids: {e}")

       
        artwork = auction.artwork
        auction.delete()

        
        if isinstance(artwork.image_url, str):
            artwork.image_url = [artwork.image_url]
        elif artwork.image_url is None:
            artwork.image_url = []

        artwork.art_status = "Active"
        artwork.save()

        return Response({"message": "Auction deleted successfully"}, status=status.HTTP_200_OK)
