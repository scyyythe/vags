from rest_framework import serializers
from api.models.transaction_model.transaction import Transaction


class AdminTransactionSerializer(serializers.Serializer):
    id = serializers.CharField(source='pk', read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    type = serializers.CharField(source='transaction_type')
    amount = serializers.FloatField()
    status = serializers.CharField(source='payment_status')

    from_user = serializers.SerializerMethodField()
    to_user = serializers.SerializerMethodField()
    artworkId = serializers.SerializerMethodField()
    artworkTitle = serializers.SerializerMethodField()

    def get_from_user(self, obj: Transaction):
        if obj.sender:
            name = f"{getattr(obj.sender, 'first_name', '')} {getattr(obj.sender, 'last_name', '')}".strip() or obj.sender.username
            return {"id": str(obj.sender.id), "name": name}
        return None

    def get_to_user(self, obj: Transaction):
        if obj.receiver:
            name = f"{getattr(obj.receiver, 'first_name', '')} {getattr(obj.receiver, 'last_name', '')}".strip() or obj.receiver.username
            return {"id": str(obj.receiver.id), "name": name}
        return None

    def get_artworkId(self, obj: Transaction):
        return str(obj.art.id) if getattr(obj, 'art', None) else None

    def get_artworkTitle(self, obj: Transaction):
        return getattr(obj.art, 'title', None) if getattr(obj, 'art', None) else None


