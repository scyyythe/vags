from rest_framework import serializers

class PayPalAuctionVerifySerializer(serializers.Serializer):
    orderID = serializers.CharField(required=True)
    sender_id = serializers.CharField(required=True)
    receiver_id = serializers.CharField(required=True)
    amount = serializers.FloatField(required=True)
    art_id = serializers.CharField(required=True)
    auction_id = serializers.CharField(required=True)
