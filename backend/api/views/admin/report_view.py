from rest_framework import status
from bson import ObjectId
from rest_framework import generics, permissions
from rest_framework.response import Response
from api.models.admin.report import Report
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.admin.report_serializers import ReportSerializer
from rest_framework.permissions import IsAuthenticated
from django.http import Http404
from datetime import datetime
from api.models.artwork_model.artwork import Art
from rest_framework import serializers
from rest_framework.views import APIView
import traceback
import logging

logger = logging.getLogger(__name__)

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

        art_id = self.request.data.get("art_id")
        if not art_id:
            raise serializers.ValidationError({"art_id": "This field is required."})

        try:
            art = Art.objects.get(id=ObjectId(art_id))
        except Art.DoesNotExist:
            raise serializers.ValidationError({"art_id": "Artwork not found."})

        existing_report = Report.objects.filter(
            user=mongo_user,
            art=art,
            status__in=["Pending", "In Progress"]
        ).first()

        if existing_report:
            raise serializers.ValidationError({
                "detail": "You have already reported this artwork and it's still under review."
            })

        
        report = serializer.save(user=mongo_user, art=art)

        Notification.objects.create(
            user=art.artist,
            art=art,
            name="Report Successful",
            action="Your report has been submitted.",
            target=art.title,
            message="Your report about the artwork has been received and is under review.",
            date=datetime.utcnow(),
        ).save()



class ReportDeleteView(generics.DestroyAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=ObjectId(self.request.user.id))

    def perform_destroy(self, instance):
        instance.delete()

class ReportStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_id = request.user.id
        try:
            art_obj_id = ObjectId(pk)
            user_obj_id = ObjectId(user_id) if isinstance(user_id, str) else user_id

            reported = Report.objects.filter(
                user=user_obj_id,
                art=art_obj_id
            ).count() > 0

            return Response({"reported": reported}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching report status: {e}")
            return Response(
                {"error": "Failed to fetch report status."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            

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