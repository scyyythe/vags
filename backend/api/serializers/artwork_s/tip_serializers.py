from rest_framework import serializers
from api.models.artwork_model.tip import Tip
from api.models.user_model.users import User

class TipSerializer(serializers.Serializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_full_name = serializers.SerializerMethodField()
    receiver = serializers.CharField()  
    amount = serializers.FloatField()
    timestamp = serializers.DateTimeField(read_only=True)  

    def get_sender_full_name(self, obj):
        """Returns sender's full name (first name + last name)"""
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip()

    def create(self, validated_data):
        sender = self.context['request'].user  
        receiver_username = validated_data.pop('receiver')

        try:
            receiver = User.objects.get(username=receiver_username)  
        except User.DoesNotExist:
            raise serializers.ValidationError({"receiver": "Artist not found."})

        if validated_data['amount'] <= 0:
            raise serializers.ValidationError({"amount": "Tip amount must be greater than 0."})

        tip = Tip.objects.create(
            sender=sender,
            receiver=receiver,
            amount=validated_data['amount']
        )
        return tip
    
class PayPalVerifySerializer(serializers.Serializer):
    orderID = serializers.CharField(required=True)
    sender_id = serializers.CharField(required=True)
    receiver_id = serializers.CharField(required=True)
    amount = serializers.FloatField(required=True)