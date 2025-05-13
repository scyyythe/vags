from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.bid import Bid, Auction
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.bid_serializers import BidSerializer, AuctionSerializer
from datetime import datetime
from api.models.interaction_model.notification import Notification
from rest_framework.views import APIView
class AuctionCreateView(APIView):
    def post(self, request, *args, **kwargs):
        try:
           
            artwork_id = request.data["artwork_id"]
            start_time = datetime.fromisoformat(request.data["start_time"])
            end_time = datetime.fromisoformat(request.data["end_time"])
            starting_bid = request.data["starting_bid"]

            
            if end_time <= start_time:
                return Response(
                    {"error": "End time must be after start time."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            
            if (end_time - start_time).days > 3:
                return Response(
                    {"error": "Auction duration cannot exceed 3 days."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            
            auction = Auction.create_auction(artwork_id, start_time, end_time, starting_bid)

            return Response({"message": "Auction created successfully!", "auction_id": str(auction.id)},
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    
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
