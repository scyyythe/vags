from bson import ObjectId
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from api.models.tip import Tip
from api.models.users import User
from api.serializers.tip_serializers import TipSerializer
from datetime import datetime

# give a tip
class TipCreateView(generics.CreateAPIView):
    serializer_class = TipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        return {"request": self.request} 

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
