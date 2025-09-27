# api/views/transaction_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.transaction_model.transaction import Transaction
from api.serializers.transaction.transaction import TransactionSerializer
from bson import ObjectId

class TransactionListView(APIView):
    """
    Retrieve all transactions or filter by user.
    """
    def get(self, request):
        user_id = request.query_params.get("user_id")
        try:
            if user_id:
                transactions = Transaction.objects.filter(
                    __raw__={"$or": [{"sender": ObjectId(user_id)}, {"receiver": ObjectId(user_id)}]}
                ).order_by("-timestamp")
            else:
                transactions = Transaction.objects.all().order_by("-timestamp")
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
