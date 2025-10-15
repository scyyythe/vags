from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from api.models.artwork_model.bid import Bid, Auction
from api.models.artwork_model.bid import AuctionStatus
from api.models.interaction_model.hidden_content import HiddenContent
from api.models.interaction_model.interaction import Like
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
from rest_framework.exceptions import PermissionDenied
from api.models.user_model.users import User
from bson import ObjectId
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now

class AuctionCreateView(APIView):
    def post(self, request, *args, **kwargs):
        try:
           
            mongo_user = User.objects.get(id=ObjectId(request.user.id))
            
      
            if mongo_user.is_suspended:
                suspension = mongo_user.get_active_suspension()
                raise PermissionDenied(
                    detail=f"Your account is suspended until {suspension.end_date.strftime('%B %d, %Y at %I:%M %p')}. Reason: {suspension.reason}"
                )
            
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

        except PermissionDenied as e:
            return Response(
                {"error": str(e.detail)},
                status=status.HTTP_403_FORBIDDEN
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
  
        now_utc = now()

        try:
         
            expired_auctions = Auction.objects(
                status=AuctionStatus.ON_GOING.value,
                end_time__lt=now_utc
            ).limit(10) 
            
            for auction in expired_auctions:
                try:
                    auction.close_auction()
                except Exception as e:
                    print(f"Error closing auction {auction.id}: {e}")
        except Exception as e:
            print(f"Error fetching expired auctions: {e}")

 
        blocked_user_ids = []
        user = self.request.user
        if user.is_authenticated and hasattr(user, "blocked_users"):
            try:
                blocked_user_ids = [str(blocked_user.id) for blocked_user in user.blocked_users]
            except Exception as e:
                print(f"Error reading blocked users: {e}")
                blocked_user_ids = []

 
        excluded_user_ids = list(User.objects.filter(
            user_status__in=["deactivated", "scheduled_for_deletion"]
        ).scalar('id'))
        
        all_blocked_ids = list(blocked_user_ids) + excluded_user_ids
        

        query = {}
        status_param = self.request.query_params.get("status")
        allowed_statuses = [choice.value for choice in AuctionStatus]

        if status_param:
            if status_param not in allowed_statuses:
                raise ValidationError(f"Invalid status filter: {status_param}")
            query["status"] = status_param

        # Filter out deleted auctions
        query["visibility__ne"] = "Deleted"

        # Apply user filtering if needed
        if all_blocked_ids:
            query["artwork__artist__nin"] = all_blocked_ids

        auctions = Auction.objects(**query)
        
        # Optimize hidden content filtering
        if self.request.user.is_authenticated:
            try:
                user = User.objects.get(id=ObjectId(self.request.user.id))
                hidden_auction_ids = list(HiddenContent.objects.filter(
                    user=user, 
                    content_type='auction'
                ).scalar('content_id'))
                
                if hidden_auction_ids:
                    hidden_object_ids = [ObjectId(hid) for hid in hidden_auction_ids]
                    auctions = auctions.filter(id__nin=hidden_object_ids)
            except Exception as e:
                print(f"Error filtering hidden auctions: {e}")
                pass
        
        # Order by creation date for consistent results
        return auctions.order_by('-updated_at')



class AuctionListViewOwner(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        include_hidden = self.request.query_params.get("include_hidden", "false").lower() == "true"
        include_deleted = self.request.query_params.get("include_deleted", "false").lower() == "true"

        
        user_artworks = Art.objects(artist=user.id).only('id')
        artwork_ids = [art.id for art in user_artworks]

        
        expired_auctions = Auction.objects(
            artwork__in=artwork_ids,
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=datetime.utcnow(),
            visibility__ne="Deleted"  # Don't try to close deleted auctions
        )

        for auction in expired_auctions:
            auction.close_auction()

        # Handle hidden auctions using HiddenContent model
        if include_hidden:
            # When include_hidden=true, show only hidden auctions
            try:
                from api.models.interaction_model.hidden_content import HiddenContent
                from bson import ObjectId
                
                hidden_contents = HiddenContent.objects.filter(user=user, content_type='auction')
                if hidden_contents:
                    hidden_auction_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                    queryset = Auction.objects(id__in=hidden_auction_ids)
                else:
                    queryset = Auction.objects.none()
            except Exception as e:
                queryset = Auction.objects.none()
        elif include_deleted:
            # When include_deleted=true, show only deleted auctions
            queryset = Auction.objects(artwork__in=artwork_ids, visibility="Deleted")
        else:
            # When include_hidden=false and include_deleted=false, get normal auctions and filter out hidden and deleted ones
            queryset = Auction.objects(artwork__in=artwork_ids, visibility__ne="Deleted")

            # Filter out hidden auctions
            try:
                from api.models.interaction_model.hidden_content import HiddenContent
                from bson import ObjectId
                
                hidden_contents = HiddenContent.objects.filter(user=user, content_type='auction')
                if hidden_contents:
                    hidden_auction_ids = [ObjectId(hc.content_id) for hc in hidden_contents]
                    queryset = queryset.filter(id__nin=hidden_auction_ids)
            except Exception as e:
                pass

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

        # Check if the requested user is blocked by the current user
        if user_id and self.request.user.is_authenticated and hasattr(self.request.user, 'blocked_users'):
            blocked_user_ids = [str(blocked_user.id) for blocked_user in self.request.user.blocked_users]
            if str(user_id) in blocked_user_ids:
                return Auction.objects.none()  # Return empty queryset if user is blocked

        
        user_artworks = Art.objects(artist=user_id).only('id')
        artwork_ids = [art.id for art in user_artworks]

       
        expired_auctions = Auction.objects(
            artwork__in=artwork_ids,
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=datetime.utcnow()
        )
        for auction in expired_auctions:
            auction.close_auction()

        
        queryset = Auction.objects(artwork__in=artwork_ids, visibility__ne="Deleted")

        
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


        expired_auctions = Auction.objects(
            status=AuctionStatus.ON_GOING.value,
            end_time__lt=now_utc
        )
        for auction in expired_auctions:
            auction.close_auction()
            auction.reload()

        # Find auctions where user has participated (either bid or viewed)
        participated_auctions = []
        all_auctions = Auction.objects(visibility__ne="Deleted")

        for auction in all_auctions:
            # Check if user has bid on this auction
            user_participated = any(
                (getattr(bid.bidder, 'id', None) and str(bid.bidder.id) == user_id)
                or (getattr(bid.bidder, 'username', None) == user_id)
                for bid in auction.bid_history
            )
            
            if user_participated:
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
        user_id = ObjectId(self.request.user.id)
        filter_type = self.request.query_params.get("filter")

        base_qs = Auction.objects(
            bid_history__bidder=user_id,
            visibility__ne="Deleted"
        )

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
        
        # Filter out blocked users from followed list
        if user.is_authenticated and hasattr(user, 'blocked_users'):
            blocked_user_ids = [str(blocked_user.id) for blocked_user in user.blocked_users]
            followed_ids = [fid for fid in followed_ids if str(fid) not in blocked_user_ids]

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
            status=AuctionStatus.ON_GOING.value,
            visibility__ne="Deleted"
        ).order_by('-updated_at')[skip:skip + page_size]
        print("Ongoing Auction Count:", auctions.count())

        serialized = AuctionSerializer(auctions, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)
    
class PopularAuctionListView(generics.ListAPIView):
    serializer_class = AuctionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now_utc = datetime.now(timezone.utc)
       
        queryset = Auction.objects(
            status=AuctionStatus.ON_GOING.value,
            end_time__gt=now_utc,
            visibility__ne="Deleted"
        )

        user = self.request.user
        blocked_user_ids = []
        if user.is_authenticated and hasattr(user, "blocked_users"):
            blocked_user_ids = [u.id for u in user.blocked_users]

        # Get deactivated and scheduled for deletion user IDs to exclude their content
        deactivated_user_ids = User.objects(user_status__iexact="deactivated").scalar('id')
        scheduled_deletion_user_ids = User.objects(user_status__iexact="scheduled_for_deletion").scalar('id')
        
        # Combine blocked, deactivated, and scheduled deletion user IDs
        all_excluded_user_ids = list(blocked_user_ids) + list(deactivated_user_ids) + list(scheduled_deletion_user_ids)
        
        if all_excluded_user_ids:
            valid_artworks = Art.objects(artist__nin=all_excluded_user_ids).only('id')
            valid_artwork_ids = [art.id for art in valid_artworks]
            queryset = queryset.filter(artwork__in=valid_artwork_ids)

      
        sorted_queryset = sorted(
            queryset,
            key=lambda auction: Like.objects(auction=auction).count(),
            reverse=True
        )

        return sorted_queryset[:4]


class ToggleHideAuctionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, auction_id):
        try:
            auction = Auction.objects.get(id=auction_id)
            user = User.objects.get(id=ObjectId(request.user.id))
        except Auction.DoesNotExist:
            return Response({"detail": "Auction not found."}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if auction is already hidden by this user
        existing_hidden = HiddenContent.objects.filter(
            user=user, 
            content_type='auction', 
            content_id=str(auction.id)
        ).first()
        
        if existing_hidden:
            # Unhide the auction for this user
            existing_hidden.delete()
            message = "Auction successfully unhidden."
        else:
            # Hide the auction for this user
            hidden_content = HiddenContent(
                user=user,
                content_type='auction',
                content_id=str(auction.id),
                hidden_at=datetime.utcnow()
            )
            hidden_content.save()
            message = "Auction successfully hidden."

        return Response(
            {"detail": message},
            status=status.HTTP_200_OK,
        )


class BulkUnhideAuctionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        try:
            user = User.objects.get(id=ObjectId(request.user.id))
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Remove all hidden content records for auctions for this user
        hidden_contents = HiddenContent.objects.filter(
            user=user,
            content_type='auction'
        )
        
        count = hidden_contents.count()
        hidden_contents.delete()

        return Response(
            {"message": f"Successfully unhid {count} auctions.", "count": count},
            status=status.HTTP_200_OK,
        )


class ReopenAuctionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, auction_id):
        try:
            auction = Auction.objects.get(id=auction_id)
            user = User.objects.get(id=ObjectId(request.user.id))
        except Auction.DoesNotExist:
            return Response({"detail": "Auction not found."}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is the owner of the artwork
        if auction.artwork.artist != user:
            return Response({"detail": "You can only reopen your own auctions."}, status=status.HTTP_403_FORBIDDEN)

        # Check if auction is closed and still has time remaining
        now = datetime.now(timezone.utc)
        if auction.status != AuctionStatus.CLOSED.value:
            return Response({"detail": "Only closed auctions can be reopened."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure end_time is timezone-aware for comparison
        end_time = auction.end_time
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        
        if now >= end_time:
            return Response({"detail": "Cannot reopen expired auctions."}, status=status.HTTP_400_BAD_REQUEST)

        # Reopen the auction
        auction.status = AuctionStatus.ON_GOING.value
        auction.save()

        # Update artwork status back to Active
        artwork = auction.artwork
        artwork.art_status = "Active"
        artwork.save()

        return Response(
            {"message": "Auction successfully reopened."},
            status=status.HTTP_200_OK,
        )