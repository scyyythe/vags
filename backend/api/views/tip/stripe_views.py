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
from api.models.transaction_model.transaction import Transaction
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
                success_url="http://localhost:8080/explore?session_id={CHECKOUT_SESSION_ID}",
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
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeVerifyPaymentView(APIView):
    def post(self, request):
        try:
            session_id = request.data.get("session_id")
            if not session_id:
                return Response({"error": "session_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch session details from Stripe
            session = stripe.checkout.Session.retrieve(session_id, expand=["payment_intent"])
            payment_intent = session.payment_intent

            if session.payment_status != "paid":
                return Response({"error": "Payment not completed"}, status=status.HTTP_400_BAD_REQUEST)

            # Metadata we sent when creating session
            sender_id = session.metadata.get("sender_id")
            receiver_id = session.metadata.get("receiver_id")
            art_id = session.metadata.get("art_id")
            amount = session.amount_total / 100.0  # Stripe uses cents
            currency = session.currency.upper()

            # Prevent duplicate transactions
            if Transaction.objects(transaction_id=session.id).first():
                return Response({"message": "Transaction already processed"}, status=status.HTTP_200_OK)

            sender = User.objects.get(id=ObjectId(sender_id))
            receiver = User.objects.get(id=ObjectId(receiver_id))
            art = Art.objects.get(id=ObjectId(art_id))

            # Save Tip
            tip = Tip(
                sender=sender,
                receiver=receiver,
                amount=amount,
                currency=currency,
                payment_method="Stripe",
                payment_status="Completed",
                transaction_id=session.id,
                timestamp=timezone.now()
            )
            tip.save()

            # Save Transaction
            transaction = Transaction(
                sender=sender,
                receiver=receiver,
                art=art,
                transaction_type="Tip",
                amount=amount,
                currency=currency,
                payment_method="Stripe",
                payment_status="Completed",
                transaction_id=session.id,
                timestamp=timezone.now(),
                extra_data={"stripe_payment_intent": payment_intent.id},
            )
            transaction.save()

            # Notify
            Notification.objects.create(
                user=receiver,
                actor=sender,
                message=f" tipped you ₱{amount} for your artwork '{art.title}'",
                art=art,
                name=f"{sender.first_name} {sender.last_name}",
                action="tipped you",
                target=art.title,
                icon="💰",
                amount=str(amount),
                donation="Tip",
                money=True,
                link=f"/artwork/{str(art.id)}",
                created_at=timezone.now(),
            )

            return Response({"message": "Payment verified and recorded"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class StripeConnectView(APIView):
    def get(self, request):
        user = request.user  # whoever is logged in
        account = stripe.Account.create(type="express")
        
        # Save account.id (acct_xxx) into DB
        user.stripe_account_id = account.id
        user.save()

        account_link = stripe.AccountLink.create(
            account=account.id,
            refresh_url="http://localhost:8080/settings/stripe/refresh",
            return_url="http://localhost:8080/settings/stripe/success",
            type="account_onboarding",
        )
        return Response({"url": account_link.url})
