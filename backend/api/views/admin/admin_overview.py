from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.transaction_model.transaction import Transaction


class AdminOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure only admins can access
        try:
            if not getattr(request.user, "role", None) == "Admin":
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Totals
            total_users = User.objects.count()

            # Consider active listings as artworks visible publicly
            active_listings = Art.objects(visibility="Public").count()

            # Sales volume over last 7 days from completed purchase transactions
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_purchases = Transaction.objects(
                transaction_type="Purchase",
                payment_status="Completed",
                timestamp__gte=seven_days_ago,
            )
            sales_volume_7d = float(sum(tx.amount for tx in recent_purchases))

            return Response(
                {
                    "totalUsers": total_users,
                    "activeListings": int(active_listings),
                    "salesVolume7d": sales_volume_7d,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


