from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models.transaction_model.transaction import Transaction
from api.serializers.admin.transaction_logs import AdminTransactionSerializer


class AdminTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not getattr(request.user, "role", None) == "Admin":
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Optional filters: last_n_days, type, status, limit
            last_n_days = int(request.query_params.get("last_n_days", 7))
            tx_type = request.query_params.get("type")
            status_filter = request.query_params.get("status")
            limit = int(request.query_params.get("limit", 50))

            since = datetime.utcnow() - timedelta(days=last_n_days)
            qs = Transaction.objects(timestamp__gte=since).order_by("-timestamp")

            if tx_type:
                qs = qs.filter(transaction_type=tx_type)
            if status_filter:
                qs = qs.filter(payment_status=status_filter)

            qs = qs[:limit]
            data = AdminTransactionSerializer(qs, many=True).data
            return Response({"results": data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


