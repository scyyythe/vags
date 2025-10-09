from bson import ObjectId
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.tip import Tip
from api.models.user_model.users import User
from api.serializers.artwork_s.tip_serializers import TipSerializer
from datetime import datetime
from api.models.transaction_model.transaction import Transaction
from django.utils import timezone
from datetime import datetime
from api.models.interaction_model.notification import Notification


class TipCreateView(generics.CreateAPIView):
    serializer_class = TipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
      
        tip = serializer.save(
            payment_method="GCash",
            payment_status="Completed",
            currency="PHP"
        )

     
        Transaction.objects.create(
            sender=tip.sender,
            receiver=tip.receiver,
            art=getattr(tip, "art", None),
            transaction_type="Tip",
            amount=tip.amount,
            currency=tip.currency,
            payment_method=tip.payment_method,
            payment_status=tip.payment_status,
            transaction_id=tip.transaction_id or None,
            timestamp=tip.timestamp or timezone.now(),
            extra_data={"manual_tip": True},
        )

       
        art = getattr(tip, "art", None)
        art_title = art.title if art else None
        art_id = str(art.id) if art else None
        link = f"/artwork/{art_id}" if art_id else "/notifications"

        Notification.objects.create(
            user=tip.receiver,
            actor=tip.sender,
            message=f"tipped you ₱{tip.amount}{f' for your artwork {art_title!r}' if art_title else ''}",
            art=art,
            name=f"{tip.sender.first_name} {tip.sender.last_name}",
            action="tipped you",
            target=art_title or "",
            icon="💰",
            amount=str(tip.amount),
            donation="Tip",
            money=True,
            link=link,
            created_at=datetime.now(),
        )

    def create(self, request, *args, **kwargs):
        """Custom response for front-end feedback"""
        response = super().create(request, *args, **kwargs)
        return Response(
            {"message": "Tip and transaction recorded successfully."},
            status=status.HTTP_201_CREATED,
        )

#  all tips
class TipListView(generics.ListAPIView):
    queryset = Tip.objects.all()
    serializer_class = TipSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# tips received by a specific artist
class TipReceivedListView(generics.ListAPIView):
    serializer_class = TipSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        artist_username = self.kwargs.get('username')

        try:
            artist = User.objects.get(username=artist_username)  
        except User.DoesNotExist:
            return Tip.objects.none()  #

        return Tip.objects(receiver=artist)  

#  total tips 
class TotalTipsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def retrieve(self, request, *args, **kwargs):
        artist_username = self.kwargs.get('username')

        try:
            artist = User.objects.get(username=artist_username)  
        except User.DoesNotExist:
            return Response({"error": "Artist not found"}, status=status.HTTP_404_NOT_FOUND)

        total_tips = Tip.objects(receiver=artist).sum('amount') 
        return Response({"artist": artist_username, "total_tips": total_tips}, status=status.HTTP_200_OK)
