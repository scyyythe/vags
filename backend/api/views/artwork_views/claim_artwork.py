from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from api.models.artwork_model.artwork import Art
from api.models.transaction_model.transaction import Transaction
from api.models.interaction_model.notification import Notification
from api.models.user_model.users import User

class ClaimArtworkPaymentView(APIView):

    def post(self, request):
        try:
            data = request.data
            art_id = data.get("art_id")
            sender_id = data.get("sender_id")
            receiver_id = data.get("receiver_id")
            amount = data.get("amount")
            payment_method = data.get("payment_method")
            transaction_id = data.get("transaction_id", "")

            missing_fields = [f for f, v in [
                ("art_id", art_id),
                ("sender_id", sender_id),
                ("receiver_id", receiver_id),
                ("amount", amount),
                ("payment_method", payment_method)
            ] if not v]

            if missing_fields:
                return Response(
                    {"error": f"Missing required fields: {missing_fields}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            amount = float(amount)

            payment_method_map = {
                "paypal": "PayPal",
                "stripe": "Stripe",
                "gcash": "GCash",
                "creditcard": "CreditCard",
                "banktransfer": "BankTransfer",
                "system": "System"
            }

            normalized_method = payment_method_map.get(payment_method.lower())
            if not normalized_method:
                return Response(
                    {"error": f"Invalid payment method: {payment_method}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            art = Art.objects.get(id=art_id)
            sender = User.objects.get(id=sender_id)
            receiver = User.objects.get(id=receiver_id)

            if Transaction.objects(transaction_id=transaction_id, transaction_type="Auction").first():
                return Response({"error": "Transaction already processed"}, status=status.HTTP_400_BAD_REQUEST)

            art.art_status = "Claimed"
            art.claimed_at = timezone.now()
            if isinstance(art.image_url, str):
                art.image_url = [art.image_url]
            art.save()

            transaction = Transaction(
                sender=sender,
                receiver=receiver,
                art=art,
                transaction_type="Auction",
                amount=amount,
                currency="PHP",
                payment_method=normalized_method,
                payment_status="Completed",
                transaction_id=transaction_id,
                timestamp=timezone.now()
            )
            transaction.save()

            Notification.objects.create(
                user=sender,
                actor=receiver,
                message=f"You received ₱{amount} because '{art.title}' was claimed",
                art=art,
                name=f"{sender.first_name} {sender.last_name}",
                action="auction payment received",
                target=art.title,
                icon="🏆",
                amount=str(amount),
                money=True,
                link=f"/artwork/{art.id}",
                created_at=timezone.now()
            )

            Notification.objects.create(
                user=receiver,
                actor=sender,
                message=f"You successfully claimed '{art.title}' and paid ₱{amount}",
                art=art,
                name=f"{receiver.first_name} {receiver.last_name}",
                action="auction claimed",
                target=art.title,
                icon="🎉",
                amount=str(amount),
                money=True,
                link=f"/artwork/{art.id}",
                created_at=timezone.now()
            )

            return Response({"message": "Artwork claimed, payment completed, and notifications sent."}, status=status.HTTP_201_CREATED)

        except Art.DoesNotExist:
            return Response({"error": "Artwork not found"}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
