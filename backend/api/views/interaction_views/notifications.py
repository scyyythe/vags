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
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

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


class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)


class MarkAllNotificationsAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated_count = Notification.objects(user=request.user, is_read=False).update(is_read=True)
        return Response({
            "message": f"{updated_count} notifications marked as read.",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)