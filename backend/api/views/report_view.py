from bson import ObjectId
from rest_framework import generics, permissions
from rest_framework.response import Response
from api.models.report import Report
from api.models.users import User
from api.models.notification import Notification
from api.serializers.report_serializers import ReportSerializer
from rest_framework.permissions import IsAuthenticated
from django.http import Http404

class ReportCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=ObjectId(self.request.user.id))

    def perform_create(self, serializer):
        try:
            mongo_user = User.objects.get(id=ObjectId(self.request.user.id))
        except Exception as e:
            print("Error retrieving user:", e)
            raise e

        report = serializer.save(user=mongo_user)

 
        Notification(
            user=mongo_user,
            message="Your report has been submitted successfully."
        ).save()


class ReportDeleteView(generics.DestroyAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=ObjectId(self.request.user.id))

    def perform_destroy(self, instance):
        instance.delete()


class ReportStatusView(generics.RetrieveAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=ObjectId(self.request.user.id))

class UserReportsView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            mongo_user = User.objects.get(id=ObjectId(self.request.user.id))
            return Report.objects.filter(user=mongo_user) 
        except User.DoesNotExist:
            return Report.objects.none()  

class ReportUpdateView(generics.UpdateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
     
        return Report.objects.filter(user=ObjectId(self.request.user.id))

    def get_object(self):
        """
        Override get_object() to manually retrieve the report instance.
        """
        report_id = self.kwargs.get("pk")
        if not report_id:
            raise Http404("No report ID provided.")
        
       
        obj = self.get_queryset().filter(id=report_id).first()
        if obj is None:
            raise Http404("Report not found.")
        
       
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_update(self, serializer):
        serializer.save()