from rest_framework import serializers

class PayPalPurchaseSerializer(serializers.Serializer):
    orderID = serializers.CharField(required=True)
    buyer_id = serializers.CharField(required=True)
    artwork_id = serializers.CharField(required=True)
    amount = serializers.FloatField(required=True)
