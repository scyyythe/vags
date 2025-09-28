from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import os
from django.utils import timezone
from bson import ObjectId
from api.models.artwork_model.artwork import Art
from api.models.purchase_model.order import PurchasedArtwork, ShippingSnapshot
from api.models.user_model.users import User
from api.models.transaction_model.transaction import Transaction
from api.serializers.transaction.marketplace_payment import PayPalPurchaseSerializer
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.paypal.com")

def get_paypal_access_token():
    resp = requests.post(
        f"{PAYPAL_API_BASE}/v1/oauth2/token",
        headers={"Accept": "application/json"},
        data={"grant_type": "client_credentials"},
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET)
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

class PayPalPurchaseVerifyView(APIView):
    def post(self, request):
        serializer = PayPalPurchaseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        order_id = data["orderID"]
        buyer_id = data["buyer_id"]
        artwork_id = data["artwork_id"]
        requested_amount = data["amount"]

        # --- Fetch artwork and buyer ---
        try:
            artwork = Art.objects.get(id=artwork_id)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            buyer = User.objects.get(id=ObjectId(buyer_id))
        except User.DoesNotExist:
            return Response({"error": "Buyer not found"}, status=status.HTTP_404_NOT_FOUND)

        # --- PayPal verification ---
        try:
            access_token = get_paypal_access_token()
            verify_resp = requests.get(
                f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            verify_resp.raise_for_status()
            order_data = verify_resp.json()
        except Exception as e:
            return Response({"error": "Failed to verify PayPal order", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if order_data.get("status") != "COMPLETED":
            return Response({"error": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)

        purchase_units = order_data.get("purchase_units", [])
        if not purchase_units:
            return Response({"error": "Invalid order data"}, status=status.HTTP_400_BAD_REQUEST)

        paypal_amount = float(purchase_units[0]["amount"]["value"])
        currency_code = purchase_units[0]["amount"]["currency_code"]

        if float(requested_amount) != paypal_amount or currency_code != "PHP":
            return Response({"error": "Amount or currency mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Check duplicate purchase ---
        if PurchasedArtwork.objects(artwork=artwork, buyer=buyer).first():
            return Response({"error": "This artwork has already been purchased by this user"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Create PurchasedArtwork ---
        default_shipping = ShippingSnapshot(
            name=buyer.first_name + " " + buyer.last_name,
            address="Default Address",  # replace with actual address logic
            city="City",
            state="State",
            country="Philippines",
            postal_code="0000",
            phone="0000-000-0000"
        )
        purchased_artwork = PurchasedArtwork(
            buyer=buyer,
            artwork=artwork,
            shipping_address=default_shipping,
            payment_method="PayPal",
            is_paid=True,
            quantity=1,
            total_price=paypal_amount,
            status="Completed",
        )
        purchased_artwork.save()

        # --- Create Transaction ---
        transaction = Transaction(
            sender=buyer,
            receiver=artwork.artist,  # assuming `artist` is a User reference
            art=artwork,
            transaction_type="Purchase",
            amount=paypal_amount,
            currency=currency_code,
            payment_method="PayPal",
            payment_status="Completed",
            transaction_id=order_id,
            timestamp=timezone.now(),
            extra_data={"artwork_id": str(artwork.id), "paypal_order": order_id}
        )
        transaction.save()

        return Response({"message": "Purchase completed successfully"}, status=status.HTTP_201_CREATED)
