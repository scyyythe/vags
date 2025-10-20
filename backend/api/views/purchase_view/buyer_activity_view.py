from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.models.transaction_model.transaction import Transaction
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from datetime import datetime, timedelta
from django.core.cache import cache
from bson import ObjectId
import hashlib

class BuyerActivityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Create cache key
            cache_key = f"buyer_activity_{request.user.id}"
            cache_key = hashlib.md5(cache_key.encode()).hexdigest()
            
            # Try to get from cache first (2 minute cache)
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return Response(cached_result, status=status.HTTP_200_OK)
            
            # Get purchase transactions where current user is the receiver
            transactions = Transaction.objects(
                receiver=request.user,
                transaction_type="Purchase"
            ).order_by("-timestamp").limit(10)
            
            # Convert to list for processing
            transactions_list = list(transactions)
            
            if not transactions_list:
                return Response([], status=status.HTTP_200_OK)
            
            # Get unique artwork and sender IDs
            artwork_ids = set()
            sender_ids = set()
            
            for transaction in transactions_list:
                if transaction.art:
                    artwork_ids.add(transaction.art.id)
                if transaction.sender:
                    sender_ids.add(transaction.sender.id)
            
            # Fetch artwork details
            artwork_details = {}
            if artwork_ids:
                artworks = Art.objects(id__in=list(artwork_ids)).only("id", "title", "image_url")
                artwork_details = {str(art.id): {"title": art.title, "image_url": art.image_url} for art in artworks}
            
            # Fetch sender details
            sender_details = {}
            if sender_ids:
                senders = User.objects(id__in=list(sender_ids)).only("id", "first_name", "last_name", "username")
                sender_details = {str(user.id): {"first_name": user.first_name, "last_name": user.last_name, "username": user.username} for user in senders}
            
            # Transform data to buyer activity format
            buyer_activities = []
            for transaction in transactions_list:
                # Determine action based on payment status
                action = "Purchased"
                if transaction.payment_status == "Completed":
                    action = "Payment Confirmed"
                elif transaction.payment_status == "Pending":
                    action = "Payment Pending"
                elif transaction.payment_status == "Failed":
                    action = "Payment Failed"
                
                # Determine status for filtering
                activity_status = "payment_received"
                if transaction.payment_status == "Completed":
                    activity_status = "payment_received"
                elif transaction.payment_status == "Pending":
                    activity_status = "awaiting_payment"
                elif transaction.payment_status == "Failed":
                    activity_status = "cancelled"
                
                # Format buyer name
                buyer_name = "Unknown Buyer"
                if transaction.sender:
                    sender_info = sender_details.get(str(transaction.sender.id), {})
                    if sender_info:
                        full_name = f"{sender_info.get('first_name', '')} {sender_info.get('last_name', '')}".strip()
                        buyer_name = full_name or sender_info.get('username', 'Unknown Buyer')
                
                # Format artwork title
                artwork_title = "Untitled Artwork"
                if transaction.art:
                    artwork_info = artwork_details.get(str(transaction.art.id), {})
                    artwork_title = artwork_info.get('title', 'Untitled Artwork')
                
                # Format timestamp to relative time
                def format_time_ago(timestamp):
                    now = datetime.utcnow()
                    if isinstance(timestamp, str):
                        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    
                    diff = now - timestamp
                    total_seconds = int(diff.total_seconds())
                    
                    if total_seconds < 60:
                        return f"{total_seconds} seconds ago"
                    elif total_seconds < 3600:
                        minutes = total_seconds // 60
                        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
                    elif total_seconds < 86400:
                        hours = total_seconds // 3600
                        return f"{hours} hour{'s' if hours > 1 else ''} ago"
                    else:
                        days = total_seconds // 86400
                        return f"{days} day{'s' if days > 1 else ''} ago"
                
                buyer_activity = {
                    "id": str(transaction.id),
                    "buyerName": buyer_name,
                    "action": action,
                    "artworkTitle": artwork_title,
                    "price": transaction.amount,
                    "timestamp": format_time_ago(transaction.timestamp),
                    "status": activity_status,
                    "artworkId": str(transaction.art.id) if transaction.art else "",
                    "transactionId": transaction.transaction_id,
                    "paymentMethod": transaction.payment_method,
                    "currency": transaction.currency,
                    "paymentStatus": transaction.payment_status,
                    "createdAt": transaction.timestamp.isoformat(),
                }
                
                buyer_activities.append(buyer_activity)
            
            # Cache the result for 2 minutes
            cache.set(cache_key, buyer_activities, 120)
            
            return Response(buyer_activities, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in BuyerActivityView: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
