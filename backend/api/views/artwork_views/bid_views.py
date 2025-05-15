from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.bid import Bid, Auction
from api.models.artwork_model.bid import AuctionStatus
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.bid_serializers import BidSerializer, AuctionSerializer
from datetime import datetime
from api.models.interaction_model.notification import Notification
from rest_framework.views import APIView
import traceback
from bson import ObjectId
from mongoengine.queryset.visitor import Q
class AuctionCreateView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            artwork_id = request.data["artwork_id"]
            start_time = datetime.fromisoformat(request.data["start_time"])
            end_time = datetime.fromisoformat(request.data["end_time"])
            start_bid_amount = float(request.data["start_bid_amount"])

            
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

            if Auction.objects(artwork=artwork_id).first():
                return Response(
                    {"error": "This artwork already has an auction."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            auction = Auction.create_auction(
                artwork_id=artwork_id,
                start_time=start_time,
                end_time=end_time,
                start_bid_amount=start_bid_amount
            )

            return Response(
                {
                    "message": "Auction created successfully!",
                    "auction_id": str(auction.id),
                    "status": auction.status
                },
                status=status.HTTP_201_CREATED
            )

        except DoesNotExist:
            return Response(
                {"error": "Artwork not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        except NotUniqueError:
            return Response(
                {"error": "This artwork is already in an active auction."},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class AuctionListView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
       
        expired_auctions = Auction.objects(
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=datetime.utcnow()
        )

        for auction in expired_auctions:
            auction.close_auction()

       
        return Auction.objects(status=AuctionStatus.ON_GOING.value)
    
class MyAuctionListView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        
        user_artworks = Art.objects(artist=user.id).only('id')
        artwork_ids = [art.id for art in user_artworks]

        
        expired_auctions = Auction.objects(
            artwork__in=artwork_ids,
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=datetime.utcnow()
        )

        for auction in expired_auctions:
            auction.close_auction()

        
        queryset = Auction.objects(artwork__in=artwork_ids)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset

  
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


    
class AuctionDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, auction_id, *args, **kwargs):
        try:
            if not ObjectId.is_valid(auction_id):
                return Response({"error": "Invalid auction ID."}, status=status.HTTP_400_BAD_REQUEST)

            auction = Auction.objects(id=auction_id).first()
            if not auction:
                return Response({"error": "Auction not found."}, status=status.HTTP_404_NOT_FOUND)

            if not auction.artwork: 
                return Response({"error": "Associated artwork not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = AuctionSerializer(auction)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
