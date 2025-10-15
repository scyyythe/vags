from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.serializers.purchase_serializer.purchase_serializer import PurchaseArtworkSerializer
from api.models.purchase_model.order import PurchasedArtwork
from api.serializers.purchase_serializer.purchase_list_serializer import PurchasedArtworkListSerializer
from api.models.payment_model.payment_accounts import PaymentAccount
from bson import ObjectId
from datetime import datetime

class PurchaseArtworkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseArtworkSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            purchase = serializer.save()
            return Response({"message": "Purchase successful!", "purchase_id": str(purchase.id)}, status=201)
        return Response(serializer.errors, status=400)

class MyPurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status")
        
        # Build optimized query with proper field selection for MongoDB
        queryset = PurchasedArtwork.objects(buyer=request.user).only(
            'id', 'artwork', 'shipping_address', 'payment_method', 'is_paid',
            'quantity', 'total_price', 'status', 'created_at', 'updated_at'
        )

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Apply ordering
        purchases = queryset.order_by("-created_at")
        
        # Get all unique artist IDs for payment account lookup
        artist_ids = set()
        for purchase in purchases:
            if purchase.artwork and purchase.artwork.artist:
                artist_ids.add(purchase.artwork.artist.id)
        
        # Pre-fetch payment accounts for all artists
        payment_accounts = {}
        if artist_ids:
            accounts = PaymentAccount.objects(
                user__in=list(artist_ids),
                type="paypal",
                is_default=True
            ).only('user', 'account_info')
            
            for account in accounts:
                payment_accounts[str(account.user.id)] = account.account_info
        
        # Build result without pagination for now
        result = []
        for purchase in purchases:
            purchase_data = {
                "id": str(purchase.id),
                "artwork": purchase.artwork, 
                "shipping_address": purchase.shipping_address,
                "payment_method": purchase.payment_method,
                "is_paid": purchase.is_paid,
                "quantity": purchase.quantity,
                "total_price": purchase.total_price,
                "status": purchase.status,
                "created_at": purchase.created_at,
                "updated_at": purchase.updated_at,
            }
            result.append(purchase_data)

        serializer = PurchasedArtworkListSerializer(result, many=True)
        return Response(serializer.data)

class MarkPurchaseCompletedView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, purchase_id):
        try:
            purchase = PurchasedArtwork.objects.get(id=ObjectId(purchase_id), buyer=request.user)
        except PurchasedArtwork.DoesNotExist:
            return Response({"error": "Purchase not found."}, status=status.HTTP_404_NOT_FOUND)

        if purchase.status == "Completed":
            return Response({"message": "Already marked as completed."}, status=status.HTTP_200_OK)

        purchase.status = "Completed"
        purchase.updated_at = datetime.utcnow()
        purchase.save()

        return Response({"message": "Purchase marked as completed."}, status=status.HTTP_200_OK)
    
class MarkPurchaseAsShippedView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, purchase_id):
        try:
            purchase = PurchasedArtwork.objects.get(id=ObjectId(purchase_id))
        except PurchasedArtwork.DoesNotExist:
            return Response({"error": "Purchase not found."}, status=status.HTTP_404_NOT_FOUND)

        if purchase.status.lower() == "To Receive":
            return Response({"message": "Already marked as shipped."}, status=status.HTTP_200_OK)

        purchase.status = "To Receive"
        purchase.updated_at = datetime.utcnow()
        purchase.save()

        return Response({"message": "Marked as shipped."}, status=status.HTTP_200_OK)