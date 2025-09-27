from rest_framework import serializers

class TransactionSerializer(serializers.Serializer):
    id = serializers.CharField()
    transaction_type = serializers.CharField()
    
    sender_first_name = serializers.SerializerMethodField()
    sender_last_name = serializers.SerializerMethodField()
    sender_profile_picture = serializers.SerializerMethodField()
    
    receiver_first_name = serializers.SerializerMethodField()
    receiver_last_name = serializers.SerializerMethodField()
    receiver_profile_picture = serializers.SerializerMethodField()
    
    amount = serializers.FloatField()
    currency = serializers.CharField()
    payment_method = serializers.CharField()
    payment_status = serializers.SerializerMethodField()  
    transaction_id = serializers.CharField()
    extra_data = serializers.JSONField()
    timestamp = serializers.DateTimeField()
    
    activity = serializers.SerializerMethodField()  

    # Sender info
    def get_sender_first_name(self, obj):
        return obj.sender.first_name if obj.sender else None

    def get_sender_last_name(self, obj):
        return obj.sender.last_name if obj.sender else None

    def get_sender_profile_picture(self, obj):
        return obj.sender.profile_picture if obj.sender else None

    # Receiver info
    def get_receiver_first_name(self, obj):
        return obj.receiver.first_name if obj.receiver else None

    def get_receiver_last_name(self, obj):
        return obj.receiver.last_name if obj.receiver else None

    def get_receiver_profile_picture(self, obj):
        return obj.receiver.profile_picture if obj.receiver else None

    # Payment status mapping
    def get_payment_status(self, obj):
        if obj.payment_status == "Completed":
            return "Success"
        return obj.payment_status

    # Activity generation
    def get_activity(self, obj):
        sender_name = f"{obj.sender.first_name} {obj.sender.last_name}" if obj.sender else "Someone"
        receiver_name = f"{obj.receiver.first_name} {obj.receiver.last_name}" if obj.receiver else "Someone"

        if obj.transaction_type == "Tip":
            return f"Sending a tip to {receiver_name}"
        elif obj.transaction_type in ["Purchase", "AuctionBid", "Donation", "CurrencyConversion"]:
            # If current user is receiver
            return f"Received payment from {sender_name}" if obj.receiver else f"Sending payment to {receiver_name}"
        return "Transaction activity"
