from rest_framework import serializers
from api.models.artwork_model.tip import Tip
from api.models.user_model.users import User
from bson import ObjectId

class TipSerializer(serializers.Serializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_full_name = serializers.SerializerMethodField()
    receiver = serializers.CharField()
    amount = serializers.FloatField()
    payment_method = serializers.CharField(default="Gcash", required=False)
    currency = serializers.CharField(default="PHP", required=False)
    payment_status = serializers.CharField(default="Completed", required=False)
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    timestamp = serializers.DateTimeField(read_only=True)

    def get_sender_full_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip()

    def create(self, validated_data):
        sender = self.context['request'].user
        receiver_value = validated_data.pop('receiver')

       
        try:
            if ObjectId.is_valid(receiver_value):
                receiver = User.objects.get(id=ObjectId(receiver_value))
            else:
                receiver = User.objects.get(username=receiver_value)
        except User.DoesNotExist:
            raise serializers.ValidationError({"receiver": "Artist not found."})

      
        if validated_data['amount'] <= 0:
            raise serializers.ValidationError({"amount": "Tip amount must be greater than 0."})

      
        tip = Tip.objects.create(
            sender=sender,
            receiver=receiver,
            amount=validated_data['amount'],
            payment_method=validated_data.get("payment_method", "GCash"),
            payment_status=validated_data.get("payment_status", "Completed"),
            currency=validated_data.get("currency", "PHP"),
            transaction_id=validated_data.get("transaction_id", None)
        )

        return tip


    
class PayPalVerifySerializer(serializers.Serializer):
    orderID = serializers.CharField(required=True)
    sender_id = serializers.CharField(required=True)
    receiver_id = serializers.CharField(required=True)
    amount = serializers.FloatField(required=True)
    art_id = serializers.CharField(required=True) 
