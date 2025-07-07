from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.bid import Auction, AuctionStatus
from api.serializers.artwork_s.auction_light_serializer import LightweightAuctionCardSerializer

class LightweightAuctionListView(APIView):
    def get(self, request):
        try:
            page = int(request.GET.get("page", 1))
            limit = int(request.GET.get("limit", 10))
        except ValueError:
            return Response({"error": "Invalid page or limit."}, status=status.HTTP_400_BAD_REQUEST)

        skip = (page - 1) * limit

        auctions = (
            Auction.objects(status=AuctionStatus.ON_GOING.value)
            .order_by("-created_at")
            .skip(skip)
            .limit(limit)
        )

        data = LightweightAuctionCardSerializer(auctions, many=True).data
        return Response(data, status=status.HTTP_200_OK)
