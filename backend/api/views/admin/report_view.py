from rest_framework import status
from bson import ObjectId
from rest_framework import generics, permissions
from rest_framework.response import Response
from api.models.admin.report import Report
from api.models.user_model.users import User
from api.models.interaction_model.notification import Notification
from api.serializers.admin.report_serializers import ReportSerializer,AuctionReportSerializer
from rest_framework.permissions import IsAuthenticated
from django.http import Http404
from datetime import datetime
from api.models.artwork_model.artwork import Art
from api.models.artwork_model.bid import Bid,Auction
from rest_framework import serializers
from rest_framework.views import APIView
import traceback
import logging
from api.models.admin.report  import AuctionReport
from bson.errors import InvalidId
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

class AuctionReportCreateView(generics.ListCreateAPIView):
    serializer_class = AuctionReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AuctionReport.objects.filter(user=ObjectId(self.request.user.id))

    def perform_create(self, serializer):
       
        report = serializer.save()

        auction = report.auction
        reporter = report.user       
        artist = auction.artwork.artist  

        now = datetime.utcnow()

        
        Notification.objects.create(
            user=reporter,
            auction=auction,
            name="Report Submitted",
            action="You submitted a report.",
            target=auction.artwork.title,
            date=now,
        ).save()

       
        Notification.objects.create(
            user=artist,
            auction=auction,
            name="Auction Reported",
            target=auction.artwork.title,
            action="A report about your auction has been submitted and is under review.",
            date=now,
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
class BulkReportStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ids = request.query_params.get("ids", "")
        id_list = [id.strip() for id in ids.split(",") if id.strip()]
        if not id_list:
            return Response({"error": "No artwork IDs provided"}, status=400)

        try:
            object_ids = [ObjectId(id) for id in id_list]
            user_obj_id = ObjectId(request.user.id)

            reports = Report.objects.filter(user=user_obj_id, art__in=object_ids)

            reported_ids = set(str(report.art.id) for report in reports)

            result = {
                str(art_id): {
                    "reported": str(art_id) in reported_ids,
                    "status": None  
                }
                for art_id in object_ids
            }

            return Response(result, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)  
             
class AuctionReportStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_id = request.user.id
        try:
            # Validate ObjectIds
            auction_obj_id = ObjectId(pk)
            user_obj_id = ObjectId(user_id) if isinstance(user_id, str) else user_id

            # Query the AuctionReport collection instead of Report
            reported = AuctionReport.objects.filter(
                user=user_obj_id,
                auction=auction_obj_id
            ).count() > 0

            return Response({"reported": reported}, status=status.HTTP_200_OK)

        except InvalidId:
            # This will catch invalid ObjectId format
            return Response(
                {"error": "Invalid auction ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # Log the actual error for debugging
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