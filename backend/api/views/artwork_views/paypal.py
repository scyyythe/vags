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
from django.utils.timesince import timesince
from django.utils import timezone
from api.models.interaction_model.notification import Notification
PAYPAL_CLIENT_ID = "ATdS3EPVWsnSLLq78MSvmBABGBnoaBfk61SOAl3VD8HjqCbC7rrPGMRtd1Z3wwrADmqdgKAOjvRVoJYw"
PAYPAL_SECRET = "EFS831oKh3OoRdzABo85_HTp-kKjsB9LP0thCdAyKyc8ayRqHTj2izUwfQoK9Bes2PQqZspRpcvh024s"
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

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
        raise Exception(f"PayPal access token fetch failed: {str(e)}")
    
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

        try:
            art = Art.objects.get(id=art_id)    
        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            access_token = get_paypal_access_token()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            verify_resp = requests.get(
                f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            verify_resp.raise_for_status()
        except requests.RequestException as e:
            return Response({"error": f"Failed to verify PayPal order: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        order_data = verify_resp.json()

        if order_data.get("status") != "COMPLETED":
            return Response({"error": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)

        purchase_units = order_data.get("purchase_units", [])
        if not purchase_units:
            return Response({"error": "Invalid order data"}, status=status.HTTP_400_BAD_REQUEST)

        paypal_amount = float(purchase_units[0]["amount"]["value"])
        currency_code = purchase_units[0]["amount"]["currency_code"]

        if float(requested_amount) != paypal_amount:
            return Response({"error": "Amount mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        if Tip.objects(transaction_id=order_id).first():
            return Response({"error": "This transaction has already been processed"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sender = User.objects.get(id=ObjectId(sender_id))
            receiver = User.objects.get(id=ObjectId(receiver_id))
        except Exception:
            return Response({"error": "User not found or invalid ID"}, status=status.HTTP_404_NOT_FOUND)

        tip = Tip(
            sender=sender,
            receiver=receiver,
            amount=paypal_amount,
            currency=currency_code,
            payment_method="PayPal",
            payment_status="Completed",
            transaction_id=order_id
        )
        tip.timestamp = timezone.now()
        tip.save()

        host = request.get_host()  
        protocol = 'http' if 'localhost' in host else 'https'
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
            created_at=datetime.now(),
        )

        return Response({"message": "Payment verified and tip recorded successfully"}, status=status.HTTP_201_CREATED)

