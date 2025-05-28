# views.py
from rest_framework import generics
from api.models.interaction_model.notification import Notification
from api.serializers.interaction_s.notifications import NotificationSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class NotificationListView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = str(self.request.user.id) 
        return Notification.objects.filter(user=user_id).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

class NotificationDeleteView(generics.DestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
      
        return Notification.objects.filter(user=self.request.user)
    
    
class NotificationDeleteAllView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        Notification.objects(user=request.user).delete()
        return Response({"message": "All notifications deleted."}, status=status.HTTP_204_NO_CONTENT)