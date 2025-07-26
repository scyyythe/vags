from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.serializers.purchase_serializer.purchase_serializer import PurchaseArtworkSerializer
from api.models.purchase_model.order import PurchasedArtwork
from api.serializers.purchase_serializer.purchase_list_serializer import PurchasedArtworkListSerializer


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
        serializer = PurchasedArtworkListSerializer(purchases, many=True)
        return Response(serializer.data)
