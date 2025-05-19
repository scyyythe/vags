from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from api.models.artwork_model.tip import Tip
from api.models.user_model.users import User

PAYPAL_CLIENT_ID = "ATdS3EPVWsnSLLq78MSvmBABGBnoaBfk61SOAl3VD8HjqCbC7rrPGMRtd1Z3wwrADmqdgKAOjvRVoJYw"
PAYPAL_SECRET = "EFS831oKh3OoRdzABo85_HTp-kKjsB9LP0thCdAyKyc8ayRqHTj2izUwfQoK9Bes2PQqZspRpcvh024st"
PAYPAL_API_BASE = "https://api.sandbox.paypal.com"

def get_paypal_access_token():
    auth_response = requests.post(
        f"{PAYPAL_API_BASE}/v1/oauth2/token",
        headers={"Accept": "application/json"},
        data={"grant_type": "client_credentials"},
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET)
    )
    auth_response.raise_for_status()
    return auth_response.json()["access_token"]

class PayPalVerifyPaymentView(APIView):

    def post(self, request):
        serializer = PayPalVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        order_id = data["orderID"]
        sender_id = data["sender_id"]
        receiver_id = data["receiver_id"]
        amount = data["amount"]

        # Get PayPal access token
        try:
            access_token = get_paypal_access_token()
        except Exception:
            return Response({"error": "Failed to get PayPal access token"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Verify the order with PayPal
        verify_resp = requests.get(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if verify_resp.status_code != 200:
            return Response({"error": "Failed to verify PayPal order"}, status=status.HTTP_400_BAD_REQUEST)

        order_data = verify_resp.json()

        if order_data["status"] != "COMPLETED":
            return Response({"error": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)

        purchase_units = order_data.get("purchase_units", [])
        if not purchase_units:
            return Response({"error": "Invalid order data"}, status=status.HTTP_400_BAD_REQUEST)

        paypal_amount = purchase_units[0]["amount"]["value"]
        currency_code = purchase_units[0]["amount"]["currency_code"]

        if float(paypal_amount) != float(amount):
            return Response({"error": "Amount mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        # Get sender and receiver User objects
        try:
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create Tip document
        tip = Tip(
            sender=sender,
            receiver=receiver,
            amount=amount,
            currency=currency_code,
            payment_method="PayPal",
            payment_status="Completed",
            transaction_id=order_id
        )
        tip.save()

        return Response({"message": "Payment verified and tip recorded successfully"})
