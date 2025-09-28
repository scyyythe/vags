from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.artwork_model.bid import Auction
from api.models.transaction_model.transaction import Transaction
from api.models.interaction_model.notification import Notification
from api.models.payment_model.payment_accounts import PaymentAccount
from api.serializers.transaction.auction_payment import PayPalAuctionVerifySerializer
from django.utils import timezone
import os, logging
logger = logging.getLogger(__name__)

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.paypal.com")

def get_paypal_access_token():
    try:
        resp = requests.post(
            f"{PAYPAL_API_BASE}/v1/oauth2/token",
            headers={"Accept": "application/json"},
            data={"grant_type": "client_credentials"},
            auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET)
        )
        resp.raise_for_status()
        return resp.json()["access_token"]
    except Exception as e:
        raise Exception("Failed to fetch PayPal access token") from e


class PayPalVerifyAuctionPaymentView(APIView):
    def post(self, request):
        serializer = PayPalAuctionVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        order_id = data["orderID"]
        sender_id = data["sender_id"]
        receiver_id = data["receiver_id"]
        requested_amount = data["amount"]
        art_id = data["art_id"]
        auction_id = data["auction_id"]

        try:
            art = Art.objects.get(id=art_id)
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            auction = Auction.objects.get(id=auction_id)
        except Auction.DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

        # PayPal token
        try:
            access_token = get_paypal_access_token()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # Verify PayPal order
        try:
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

        # Check duplicate auction payment
        if Transaction.objects(transaction_id=order_id, transaction_type="Auction").first():
            return Response({"error": "This auction payment has already been processed"}, status=status.HTTP_400_BAD_REQUEST)

        # Get users
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
        except Exception:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        payment_account = PaymentAccount.objects(user=receiver, type="paypal", is_default=True).first()
        if not payment_account:
            return Response({"error": "Receiver has no default PayPal account"}, status=status.HTTP_400_BAD_REQUEST)

        # Save Transaction
        transaction = Transaction(
            sender=sender,
            receiver=receiver,
            art=art,
            auction=auction,
            transaction_type="Auction",
            amount=paypal_amount,
            currency=currency_code,
            payment_method="PayPal",
            payment_status="Completed",
            transaction_id=order_id,
            timestamp=timezone.now(),
            extra_data={"paypal_order": order_id}
        )
        transaction.save()

        # Notification
        Notification.objects.create(
            user=receiver,
            actor=sender,
            message=f"You received ₱{paypal_amount} for winning auction '{art.title}'",
            art=art,
            name=f"{sender.first_name} {sender.last_name}",
            action="auction payment received",
            target=art.title,
            icon="🏆",
            amount=str(paypal_amount),
            money=True,
            link=f"/artwork/{art.id}",
            created_at=timezone.now()
        )

        return Response({"message": "Auction payment verified successfully"}, status=status.HTTP_201_CREATED)
