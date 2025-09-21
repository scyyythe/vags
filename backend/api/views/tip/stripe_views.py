import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.tip import Tip
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.interaction_model.notification import Notification
from django.utils import timezone
from bson import ObjectId
from django.conf import settings

class StripeCreateCheckoutSessionView(APIView):
    def post(self, request):
        try:
            amount = int(float(request.data.get("amount", 0)) * 100)  # Stripe uses cents
            art_id = request.data.get("art_id")
            artist_id = request.data.get("receiver_id")
            sender_id = request.data.get("sender_id")

            if not amount or amount <= 0:
                return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

            art = Art.objects.get(id=art_id)
            receiver = User.objects.get(id=ObjectId(artist_id))
            sender = User.objects.get(id=ObjectId(sender_id))

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "php",
                            "product_data": {
                                "name": f"Tip for {art.title}",
                            },
                            "unit_amount": amount,
                        },
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url="http://localhost:8080/explore",
                cancel_url="http://localhost:8080/explore",
                metadata={
                    "sender_id": str(sender.id),
                    "receiver_id": str(receiver.id),
                    "art_id": str(art.id),
                },
            )

            return Response({"id": session.id, "url": session.url}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
