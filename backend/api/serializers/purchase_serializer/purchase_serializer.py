from rest_framework import serializers
from api.models.purchase_model.order import PurchasedArtwork, ShippingSnapshot
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.models.transaction_model.transaction import Transaction
from datetime import datetime
from bson import ObjectId

class ShippingSnapshotSerializer(serializers.Serializer):
    name = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    country = serializers.CharField()
    postal_code = serializers.CharField()
    phone = serializers.CharField()

class PurchaseArtworkSerializer(serializers.Serializer):
    artwork_id = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=["PayPal", "GCash", "Credit Card", "Stripe"])
    is_paid = serializers.BooleanField(default=False)
    quantity = serializers.IntegerField(default=1)
    shipping_address = ShippingSnapshotSerializer()

    def create(self, validated_data):
        request = self.context["request"]
        try:
            mongo_user = User.objects.get(id=ObjectId(request.user.id))
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        try:
            artwork = Art.objects.get(id=ObjectId(validated_data["artwork_id"]))
        except Art.DoesNotExist:
            raise serializers.ValidationError("Artwork not found.")

        snapshot_data = validated_data.pop("shipping_address")
        shipping_snapshot = ShippingSnapshot(**snapshot_data)

        quantity = validated_data.get("quantity", 1)
        if artwork.quantity is not None and quantity > artwork.quantity:
            raise serializers.ValidationError("Requested quantity exceeds available stock.")

        total_price = artwork.price * quantity

        # Create purchase record
        purchase = PurchasedArtwork.objects.create(
            buyer=mongo_user,
            artwork=artwork,
            shipping_address=shipping_snapshot,
            payment_method=validated_data["payment_method"],
            is_paid=validated_data.get("is_paid", False),
            quantity=quantity,
            total_price=total_price,
            status="Paid",
        )

        # Update artwork quantity/status
        if artwork.edition == "Open Edition" and artwork.quantity is not None:
            artwork.quantity -= quantity
            if artwork.quantity == 0:
                artwork.art_status = "Sold Out"
            else:
                artwork.art_status = "To Receive"
        else:
            artwork.art_status = "To Receive"
        artwork.save()

        now = datetime.now()

        # Create notifications
        Notification.objects.create(
            user=artwork.artist,
            actor=mongo_user,
            message=f"{mongo_user.first_name} {mongo_user.last_name} ordered your artwork: '{artwork.title}'",
            name=f"{mongo_user.first_name} {mongo_user.last_name}",
            action="purchased your artwork",
            target=artwork.title,
            icon="purchase",
            created_at=datetime.now(),
            link=f"/artwork/{artwork.id}/"
        )

        Notification.objects.create(
            user=mongo_user,
            actor=mongo_user,
            message=f"You successfully ordered: '{artwork.title}'",
            name=f"{mongo_user.first_name} {mongo_user.last_name}",
            action="purchased an artwork",
            target=artwork.title,
            icon="purchase",
            created_at=datetime.now(),
            link=f"/viewproduct/{purchase.id}/"
        )

        # Insert Transaction record
        Transaction(
            sender=mongo_user,
            receiver=artwork.artist,
            art=artwork,
            transaction_type="Purchase",
            amount=total_price,
            currency="PHP",
            payment_method=validated_data["payment_method"],
            payment_status="Completed" if validated_data.get("is_paid", False) else "Pending",
            transaction_id=str(ObjectId()),  # generate unique id
            extra_data={"purchase_id": str(purchase.id)},
            timestamp=now
        ).save()

        return purchase
