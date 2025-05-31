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
from api.models.artwork_model.bid import Bid,Auction
from rest_framework import serializers
from rest_framework.views import APIView
import traceback
import logging
from bson.errors import InvalidId
from rest_framework.exceptions import ValidationError
logger = logging.getLogger(__name__)

class ReportCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=ObjectId(self.request.user.id))

    def perform_create(self, serializer):
       
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
        except ValidationError as e:
          
            detail = e.detail.get("detail") if isinstance(e.detail, dict) else str(e.detail)

            if detail and ("already reported" in detail.lower() or "still under review" in detail.lower()):
                return Response(e.detail, status=status.HTTP_409_CONFLICT) 
          
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(serializer.data)

     
        user = request.user
        mongo_user = User.objects.get(id=ObjectId(user.id))

        art = serializer.instance.art
        auction = serializer.instance.auction
        reported_user = serializer.instance.reported_user
        
        host = request.get_host()
        protocol = "http" if "localhost" in host else "https"

        if art:
            link = f"/artwork/{str(art.id)}"
            Notification.objects.create(
                user=art.artist,
                actor=mongo_user,
                message=f"A report was submitted on your artwork '{art.title}'",
                art=art,
                name=f"{mongo_user.first_name} {mongo_user.last_name}",
                action="reported your artwork",
                target=art.title,
                icon="report",
                created_at=datetime.now(),
                link=link,
            )

        if auction:
            artist = auction.artwork.artist
            link = f"/bid/{str(auction.id)}/"

            Notification.objects.create(
                user=mongo_user,
                actor=mongo_user,
                message=f"Submitted a report for the auction '{auction.artwork.title}'.",
                auction=auction,
                name=f"{mongo_user.first_name} {mongo_user.last_name}",
                action="submitted a report",
                target=auction.artwork.title,
                icon="report",
                created_at=datetime.now(),
                link=link,
            )

            Notification.objects.create(
                user=artist,
                actor=mongo_user,
                message=f"A report was submitted for your auction '{auction.artwork.title}', and it's under review.",
                auction=auction,
                name=f"{mongo_user.first_name} {mongo_user.last_name}",
                action="reported your auction",
                target=auction.artwork.title,
                icon="alert",
                created_at=datetime.now(),
                link=link,
            )
            
        if reported_user:
            link = f"/userprofile/{str(reported_user.id)}"
            notif = Notification.objects.create(
                user=mongo_user, 
                actor=mongo_user,
                message=f"You reported the artist '{reported_user.first_name} {reported_user.last_name}'.",
                name=f"{mongo_user.first_name} {mongo_user.last_name}",
                action="reported user",
                target=f"{reported_user.first_name} {reported_user.last_name}",
                icon="report",
                created_at=datetime.now(),
                link=link,
            )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ReportDeleteView(generics.DestroyAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Report.objects.filter(user=ObjectId(self.request.user.id))

    def perform_destroy(self, instance):
        instance.delete()
        
class UndoReportView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        report_id = request.data.get("id")
        report_type = request.data.get("type")

        if not report_id or report_type != "auction":
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = Report.objects.get(user=ObjectId(request.user.id), auction=ObjectId(report_id))
            report.delete()
            return Response({"detail": "Report undone"}, status=status.HTTP_204_NO_CONTENT)
        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            auction_obj_id = ObjectId(pk)
            user_obj_id = ObjectId(user_id) if isinstance(user_id, str) else user_id

            reported = Report.objects.filter(
                user=user_obj_id,
                auction=auction_obj_id
            ).count() > 0

            return Response({"reported": reported}, status=status.HTTP_200_OK)

        except InvalidId:
            return Response(
                {"error": "Invalid auction ID."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Error fetching report status: {e}")
            return Response(
                {"error": "Failed to fetch report status."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class BulkAuctionReportStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ids = request.query_params.get("ids", "")
        id_list = [id.strip() for id in ids.split(",") if id.strip()]

        if not id_list:
            return Response({"error": "No auction IDs provided"}, status=400)

        try:
            object_ids = [ObjectId(id) for id in id_list]
            user_obj_id = ObjectId(request.user.id)


            reports = Report.objects.filter(user=user_obj_id, auction__in=object_ids)

           
            reports_by_auction = {str(report.auction.id): report for report in reports if report.auction}

           
            result = {
                auction_id: {
                    "reported": auction_id in reports_by_auction,
                    "status": getattr(reports_by_auction.get(auction_id), "status", None) if auction_id in reports_by_auction else None
                }
                for auction_id in id_list
            }

            return Response(result, status=200)

        except InvalidId:
            return Response({"error": "One or more invalid auction IDs"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
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