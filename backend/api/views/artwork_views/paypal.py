from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from api.models.artwork_model.tip import Tip
from api.models.user_model.users import User
from bson import ObjectId
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.tip_serializers import PayPalVerifySerializer
from datetime import datetime
from django.conf import settings
from django.utils.timesince import timesince
from django.utils import timezone
from api.models.interaction_model.notification import Notification
import os
from api.models.transaction_model.transaction import Transaction

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")

def get_paypal_access_token():
    try:
        auth_response = requests.post(
            f"{PAYPAL_API_BASE}/v1/oauth2/token",
            headers={"Accept": "application/json"},
            data={"grant_type": "client_credentials"},
            auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET)
        )
        auth_response.raise_for_status()
        return auth_response.json()["access_token"]
    except requests.RequestException as e:
        raise Exception("Failed to fetch PayPal access token") from e

class PayPalVerifyPaymentView(APIView):
    def post(self, request):
        serializer = PayPalVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        order_id = data["orderID"]
        sender_id = data["sender_id"]
        receiver_id = data["receiver_id"]
        requested_amount = data["amount"]
        art_id = data.get("art_id")

        # --- Check artwork exists ---
        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        # --- Get PayPal access token ---
        try:
            access_token = get_paypal_access_token()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # --- Verify PayPal order ---
        try:
            verify_resp = requests.get(
                f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            verify_resp.raise_for_status()
            order_data = verify_resp.json()
        except requests.RequestException as e:
            return Response({"error": "Failed to verify PayPal order", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if order_data.get("status") != "COMPLETED":
            return Response({"error": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)

        purchase_units = order_data.get("purchase_units", [])
        if not purchase_units:
            return Response({"error": "Invalid order data"}, status=status.HTTP_400_BAD_REQUEST)

        paypal_amount = float(purchase_units[0]["amount"]["value"])
        currency_code = purchase_units[0]["amount"]["currency_code"]

        # --- Validate amount and currency ---
        if float(requested_amount) != paypal_amount:
            return Response({"error": "Amount mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        if currency_code != "PHP":
            return Response({"error": f"Invalid currency: {currency_code}"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Check duplicate transaction ---
        if Tip.objects(transaction_id=order_id).first():
            return Response({"error": "This transaction has already been processed"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Get sender and receiver ---
        try:
            sender = User.objects.get(id=ObjectId(sender_id))
            receiver = User.objects.get(id=ObjectId(receiver_id))
        except Exception:
            return Response({"error": "User not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)

        # --- Save Tip ---
        tip = Tip(
            sender=sender,
            receiver=receiver,
            amount=paypal_amount,
            currency=currency_code,
            payment_method="PayPal",
            payment_status="Completed",
            transaction_id=order_id,
            timestamp=timezone.now()
        )
        tip.save()
        
        transaction = Transaction(
            sender=sender,
            receiver=receiver,
            art=art,
            transaction_type="Tip",
            amount=paypal_amount,
            currency=currency_code,
            payment_method="PayPal",
            payment_status="Completed",
            transaction_id=order_id,
            timestamp=timezone.now(),
            extra_data={
                "art_title": art.title,
                "paypal_order": order_id
            }
        )
        transaction.save()

                # --- Create Notification ---
        link = f"/artwork/{str(art.id)}"
        Notification.objects.create(
            user=receiver,
            actor=sender,
            message=f" tipped you ₱{paypal_amount} for your artwork '{art.title}'",
            art=art,
            name=f"{sender.first_name} {sender.last_name}",
            action="tipped you",
            target=art.title,
            icon="💰",
            amount=str(paypal_amount),
            donation="Tip",
            money=True,
            link=link,
            created_at=timezone.now(),
        )

        return Response({"message": "Payment verified and tip recorded successfully"}, status=status.HTTP_201_CREATED)
