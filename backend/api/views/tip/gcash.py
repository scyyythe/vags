from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from django.utils import timezone
from datetime import datetime
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.transaction_model.transaction import Transaction
from api.models.artwork_model.tip import Tip
from api.models.interaction_model.notification import Notification
from api.models.payment_model.payment_accounts import PaymentAccount
import logging
import os

logger = logging.getLogger(__name__)


class GetArtistGCashAccountView(APIView):
    """
    Fetch the artist's GCash info (to show QR or number to the user)
    """
    def get(self, request, artist_id):
        try:
            artist = User.objects.get(id=ObjectId(artist_id))
            payment = PaymentAccount.objects(user=artist, type="gcash").first()

            if not payment:
                return Response({"error": "Artist has no GCash account."}, status=404)

            return Response({
                "artist_name": f"{artist.first_name} {artist.last_name}",
                "gcash_name": payment.name,
                "gcash_number": payment.account_info,
                "details": payment.details,
            }, status=200)
        except Exception as e:
            logger.exception("Error fetching artist GCash info")
            return Response({"error": str(e)}, status=400)


class SubmitGCashProofView(APIView):
    """
    User uploads proof after sending money manually.
    """
    def post(self, request):
        try:
            amount = request.data.get("amount")
            artist_id = request.data.get("artist_id")
            art_id = request.data.get("art_id")
            sender_id = request.data.get("sender_id")
            proof_image = request.data.get("proof_image")  # optional: base64 or image URL
            reference_number = request.data.get("reference_number", "")
            note = request.data.get("note", "")

            if not all([amount, artist_id, art_id, sender_id]):
                return Response({"error": "Missing fields"}, status=400)

            # Validate IDs
            artist = User.objects.get(id=ObjectId(artist_id))
            art = Art.objects.get(id=ObjectId(art_id))
            sender = User.objects.get(id=ObjectId(sender_id))

            # Save Tip (Pending verification)
            tip = Tip(
                sender=sender,
                receiver=artist,
                amount=float(amount),
                currency="PHP",
                payment_method="GCash",
                payment_status="Pending Verification",
                transaction_id=f"manual-{datetime.now().timestamp()}",
                timestamp=timezone.now(),
                extra_data={
                    "reference_number": reference_number,
                    "proof_image": proof_image,
                    "note": note,
                }
            )
            tip.save()

            # Save Transaction record
            transaction = Transaction(
                sender=sender,
                receiver=artist,
                art=art,
                transaction_type="Tip",
                amount=float(amount),
                currency="PHP",
                payment_method="GCash (Manual)",
                payment_status="Pending Verification",
                transaction_id=tip.transaction_id,
                timestamp=timezone.now(),
                extra_data={
                    "proof_image": proof_image,
                    "reference_number": reference_number,
                    "note": note,
                },
            )
            transaction.save()

            # Notify artist (optional)
            Notification.objects.create(
                user=artist,
                actor=sender,
                message=f" sent ₱{amount} via GCash for '{art.title}' (pending verification)",
                art=art,
                name=f"{sender.first_name} {sender.last_name}",
                action="sent a tip",
                target=art.title,
                icon="💸",
                amount=str(amount),
                donation="Tip",
                money=True,
                link=f"/artwork/{str(art.id)}",
                created_at=datetime.now(),
            )

            logger.info(f"Manual GCash Tip submitted by {sender.id} for artist {artist.id}")
            return Response({"message": "Proof submitted successfully", "status": "Pending Verification"}, status=201)

        except Exception as e:
            logger.exception("Error submitting GCash proof")
            return Response({"error": str(e)}, status=400)
