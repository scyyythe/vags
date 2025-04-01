from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from api.models.bid import Bid, Auction
from api.models.artwork import Art
from api.serializers.bid_serializers import BidSerializer, AuctionSerializer
from datetime import datetime

class CreateAuctionView(generics.CreateAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]  

    def create(self, request, *args, **kwargs):
        artwork_id = request.data.get("artwork")
        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")

        if not artwork_id or not start_time or not end_time:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            artwork = Art.objects.get(id=artwork_id)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found."}, status=status.HTTP_404_NOT_FOUND)

        if Auction.objects.filter(artwork=artwork, status=True).count() > 0:
            return Response({"error": "An active auction for this artwork already exists."}, status=status.HTTP_400_BAD_REQUEST)

        auction = Auction.objects.create(
            artwork=artwork,
            start_time=start_time,
            end_time=end_time,
            status=True
        )

        return Response(AuctionSerializer(auction).data, status=status.HTTP_201_CREATED)

    
class PlaceBidView(generics.CreateAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {"request": self.request} 

class BidHistoryView(generics.ListAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        artwork_id = self.kwargs.get('artwork_id')
        return Bid.objects.filter(artwork=artwork_id).order_by('-timestamp')

class AuctionListView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        expired_auctions = Auction.objects.filter(status=True, end_time__lt=datetime.utcnow)
        for auction in expired_auctions:
            auction.close_auction()  

        return Auction.objects.all()

class ActiveAuctionsView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        expired_auctions = Auction.objects.filter(status=True, end_time__lt=datetime.utcnow)
        for auction in expired_auctions:
            auction.close_auction()

        return Auction.objects.filter(status=True)

class CloseAuctionView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, *args, **kwargs):
        artwork_id = self.kwargs.get('artwork_id')

        try:
            auction = Auction.objects.get(artwork=artwork_id, status=True)
        except Auction.DoesNotExist:
            return Response({"error": "Auction not found or already closed."}, status=status.HTTP_404_NOT_FOUND)

        auction.close_auction()
        return Response({"message": "Auction closed successfully."}, status=status.HTTP_200_OK)

class HighestBidView(generics.RetrieveAPIView):
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        artwork_id = self.kwargs.get('artwork_id')
        auction = Auction.objects.filter(artwork=artwork_id, status=True).first()
        
        if not auction:
            return Response({"error": "Auction not found or closed."}, status=status.HTTP_404_NOT_FOUND)
        
        if not auction.highest_bid:
            return Response({"message": "No bids placed yet."}, status=status.HTTP_200_OK)
        
        return Response(BidSerializer(auction.highest_bid).data, status=status.HTTP_200_OK)
