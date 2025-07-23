from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.serializers.purchase_serializer import PurchaseArtworkSerializer


class PurchaseArtworkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseArtworkSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            purchase = serializer.save()
            return Response({"message": "Purchase successful!", "purchase_id": str(purchase.id)}, status=201)
        return Response(serializer.errors, status=400)
