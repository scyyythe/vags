
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.serializers.user_s.top_sellers_serializer import TopSellerSerializer
from mongoengine.queryset.visitor import Q

class TopSellersAPIView(APIView):
    def get(self, request):
      
        users = User.objects(role="User", user_status="Active")

        seller_data = []

        for user in users:
            on_sale_count = Art.objects(artist=user, art_status__iexact="onSale").count()
            if on_sale_count > 0:
                seller_data.append({
                    "id": str(user.id),
                    "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                    "avatar": user.profile_picture or "",
                    "rating": 5.0, 
                    "art_count": on_sale_count
                })

        sorted_sellers = sorted(seller_data, key=lambda x: x["art_count"], reverse=True)

        return Response(sorted_sellers, status=status.HTTP_200_OK)
