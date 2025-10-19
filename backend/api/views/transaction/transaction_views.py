# api/views/transaction_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.transaction_model.transaction import Transaction
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.serializers.transaction.transaction import TransactionSerializer
from bson import ObjectId

class TransactionListView(APIView):
    def get(self, request):
        user_id = request.query_params.get("user_id")
        transaction_type = request.query_params.get("type")
        receiver_only = request.query_params.get("receiver_only", "false").lower() == "true"
        include_artwork = request.query_params.get("include_artwork", "false").lower() == "true"
        include_sender = request.query_params.get("include_sender", "false").lower() == "true"
        
        try:
            if not user_id:
                return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            user_object_id = ObjectId(user_id)
            
            # Build query filters
            query_filters = {}
            
            if receiver_only:
                query_filters["receiver"] = user_object_id
            else:
                query_filters["__raw__"] = {"$or": [{"sender": user_object_id}, {"receiver": user_object_id}]}
            
            if transaction_type:
                query_filters["transaction_type"] = transaction_type
            
            transactions = Transaction.objects(**query_filters).order_by("-timestamp")
            
            # Convert to list for processing
            transactions_list = list(transactions)
            
            # If we need to include artwork or sender details, fetch them
            if include_artwork or include_sender:
                # Get unique artwork and sender IDs
                artwork_ids = set()
                sender_ids = set()
                
                for transaction in transactions_list:
                    if transaction.art and include_artwork:
                        artwork_ids.add(transaction.art)
                    if transaction.sender and include_sender:
                        sender_ids.add(transaction.sender)
                
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
                
                # Add details to transactions
                for transaction in transactions_list:
                    if include_artwork and transaction.art:
                        transaction.artwork = artwork_details.get(str(transaction.art.id), {})
                    if include_sender and transaction.sender:
                        transaction.sender_details = sender_details.get(str(transaction.sender.id), {})

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TransactionSerializer(transactions_list, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

