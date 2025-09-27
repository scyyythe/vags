from rest_framework import serializers
from api.models.transaction_model.transaction import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    receiver_username = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "transaction_type",
            "sender_username",
            "receiver_username",
            "amount",
            "currency",
            "payment_method",
            "payment_status",
            "transaction_id",
            "extra_data",
            "timestamp",
        ]
