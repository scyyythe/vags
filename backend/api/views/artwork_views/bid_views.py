from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from api.models.artwork_model.bid import Bid, Auction
from api.models.artwork_model.bid import AuctionStatus
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.bid_serializers import BidSerializer, AuctionSerializer
from api.models.interaction_model.follows import Follower
from datetime import datetime
from api.models.interaction_model.notification import Notification
from rest_framework.views import APIView
import traceback
from bson import ObjectId
from mongoengine.queryset.visitor import Q
from datetime import datetime, timezone 
from mongoengine import DoesNotExist
from mongoengine.errors import NotUniqueError
from mongoengine.queryset.visitor import Q
class AuctionCreateView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            artwork_id = request.data["artwork_id"]
            start_time = datetime.fromisoformat(request.data["start_time"])
            end_time = datetime.fromisoformat(request.data["end_time"])
            start_bid_amount = float(request.data["start_bid_amount"])

            artwork = Art.objects.get(id=artwork_id)
            
            if artwork.art_status != "Active":
                return Response(
                    {"error": "Auction can only be created for artworks with status 'Active'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
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

            existing_auction = Auction.objects(
                artwork=artwork_id,
                status=AuctionStatus.ON_GOING.value
            ).first()

            if existing_auction:
                return Response(
                    {"error": "This artwork already has an active auction."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            
            sold_auction = Auction.objects(
                artwork=artwork_id,
                status=AuctionStatus.SOLD.value
            ).first()

            if sold_auction:
                return Response(
                    {"error": "This artwork has already been sold in a previous auction."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            previous_auction = Auction.objects(
                artwork=artwork_id,
                status="closed",  
                bid_history__size=0  
            ).first()

            if previous_auction:
                previous_auction.status = "reauctioned"
                previous_auction.save()

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

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class AuctionListView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        now_utc = datetime.now(timezone.utc)
        expired_auctions = Auction.objects(
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=now_utc
        )
        for auction in expired_auctions:
            auction.close_auction()
            auction.reload()

        auction_ids = self.request.query_params.get("auction_ids")
        if auction_ids:
            ids = auction_ids.split(",")
            return Auction.objects(id__in=ids)

        return Auction.objects()

class AuctionListViewOwner(generics.ListAPIView):
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
        
class AuctionListViewSpecificUser(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.request.query_params.get('userId')

        if not user_id:
            return Auction.objects.none()

        
        user_artworks = Art.objects(artist=user_id).only('id')
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


class AuctionListViewParticipated(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get('userId')
        if not user_id:
            return Auction.objects.none()

        now_utc = datetime.now(timezone.utc)

        # Close expired auctions before querying
        expired_auctions = Auction.objects(
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=now_utc
        )
        for auction in expired_auctions:
            auction.close_auction()
            auction.reload()

        # Filter auctions where the user has participated (in bid_history or viewed_by)
        # Assuming bid_history is a list of Bid objects with bidder user reference or username

        # We'll filter all auctions where any bid in bid_history has a bidder matching user_id

        # MongoEngine doesn't support deep filtering in arrays easily, so we do it manually here:
        participated_auctions = []
        all_auctions = Auction.objects()

        for auction in all_auctions:
            # Check if user participated in bids
            participated = any(
                (getattr(bid.bidder, 'id', None) and str(bid.bidder.id) == user_id)
                or (getattr(bid.bidder, 'username', None) == user_id)
                for bid in auction.bid_history
            )
            if participated:
                participated_auctions.append(auction)

        return participated_auctions
    
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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly ]

    def get(self, request, auction_id, *args, **kwargs):
        try:
           
            if not ObjectId.is_valid(auction_id):
                return Response({"error": "Invalid auction ID."}, status=status.HTTP_400_BAD_REQUEST)

           
            auction = Auction.objects(id=auction_id).first()
            if not auction:
                return Response({"error": "Auction not found."}, status=status.HTTP_404_NOT_FOUND)

            if not auction.artwork:
                return Response({"error": "Associated artwork not found."}, status=status.HTTP_404_NOT_FOUND)

            
            user = request.user if request.user and request.user.is_authenticated else None
            if user and user not in auction.viewed_by:
                auction.viewed_by.append(user)
                auction.save()

           
            serializer = AuctionSerializer(auction, context={"request": request})
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


class MyBidsAuctionListView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = str(self.request.user.id)
        filter_type = self.request.query_params.get("filter")

        base_qs = Auction.objects(bid_history__bidder=user_id).distinct()

        if filter_type == "won":
            return base_qs.filter(status="sold", highest_bid__bidder=user_id)
        elif filter_type == "active":
            return base_qs.filter(status="on_going")
        elif filter_type == "lost":
            return base_qs.filter(status="closed", highest_bid__bidder__ne=user_id)
        
        return base_qs


class FollowedAuctionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        page = int(request.query_params.get('page', 1))
        page_size = 10
        skip = (page - 1) * page_size

        followed_users = Follower.objects.filter(follower=user)
        followed_ids = [f.following.id for f in followed_users]
       

        if not followed_ids:
            return Response([], status=status.HTTP_200_OK)

        artworks = Art.objects(artist__in=followed_ids)
        artwork_ids = [art.id for art in artworks]
       

        now_utc = datetime.now(timezone.utc)

        expired_auctions = Auction.objects(
            artwork__in=artwork_ids,
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=now_utc
        )
        for auction in expired_auctions:
            auction.close_auction()

        auctions = Auction.objects(
            artwork__in=artwork_ids,
            status=AuctionStatus.ON_GOING.value
        ).order_by('-created_at')[skip:skip + page_size]
        print("Ongoing Auction Count:", auctions.count())

        serialized = AuctionSerializer(auctions, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)