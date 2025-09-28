from rest_framework import serializers

class TransactionSerializer(serializers.Serializer):
    id = serializers.CharField()
    transaction_type = serializers.CharField()
    sender_id = serializers.SerializerMethodField()
    receiver_id = serializers.SerializerMethodField()
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
    type = serializers.SerializerMethodField()      

    def get_sender_id(self, obj):
        return str(obj.sender.id) if obj.sender else None

    def get_receiver_id(self, obj):
        return str(obj.receiver.id) if obj.receiver else None
    
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

    def get_type(self, obj):
        """
        Returns Sent / Received / Converted depending on the user.
        """
        request_user = self.context["request"].user if "request" in self.context else None
        if obj.transaction_type == "CurrencyConversion":
            return "Converted"
        elif request_user:
            if obj.sender and str(obj.sender.id) == str(request_user.id):
                return "Sent"
            elif obj.receiver and str(obj.receiver.id) == str(request_user.id):
                return "Received"
        return "Sent"

    def get_activity(self, obj):
        """
        Generates human-readable activity for the frontend
        """
        request_user = self.context["request"].user if "request" in self.context else None
        sender_name = f"{obj.sender.first_name} {obj.sender.last_name}" if obj.sender else "Someone"
        receiver_name = f"{obj.receiver.first_name} {obj.receiver.last_name}" if obj.receiver else "Someone"

        if obj.transaction_type == "Tip":
            if request_user and str(request_user.id) == str(obj.sender.id):
                return f"Sending a tip to {receiver_name}"
            elif request_user and str(request_user.id) == str(obj.receiver.id):
                return f"Received a tip from {sender_name}"
            else:
                return f"{sender_name} tipped {receiver_name}"
        elif obj.transaction_type == "CurrencyConversion":
            return "Currency conversion"
        else:
            if request_user and str(request_user.id) == str(obj.receiver.id):
                return f"Received payment from {sender_name}"
            return f"Sending payment to {receiver_name}"