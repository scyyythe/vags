from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.serializers.purchase_serializer.purchase_serializer import PurchaseArtworkSerializer
from api.models.purchase_model.order import PurchasedArtwork
from api.serializers.purchase_serializer.purchase_list_serializer import PurchasedArtworkListSerializer
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
        queryset = PurchasedArtwork.objects(buyer=request.user)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        purchases = queryset.order_by("-created_at")

        
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