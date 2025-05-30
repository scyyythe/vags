from rest_framework import serializers
from api.models.admin.report import Report
from api.models.admin.report  import AuctionReport
from api.models.artwork_model.bid import Auction
from bson import ObjectId
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art

class ReportSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    art_id = serializers.CharField(write_only=True, required=True) 
    issue_details = serializers.CharField(required=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
  
        art_id = validated_data.pop("art_id", None)

        if not art_id:
       
            raise serializers.ValidationError({"art_id": "Artwork ID is required."})

        try:
            art = Art.objects.get(id=ObjectId(art_id))
        except Art.DoesNotExist:
          
            raise serializers.ValidationError({"art_id": "Artwork not found."})

        user = self.context["request"].user
       
        try:
            user_obj = User.objects.get(id=ObjectId(user.id))
        except User.DoesNotExist:
           
            raise serializers.ValidationError({"user": "User not found."})

        existing_report = Report.objects.filter(
            user=user_obj,
            art=art,
            status__in=["Pending", "In Progress"]
        ).first()

        if existing_report:
          
            raise serializers.ValidationError({
                "detail": "You have already reported this artwork and it's still under review."
            })

        report = Report(
            user=user_obj,
            art=art,
            issue_details=validated_data.get("issue_details"),
        )
        report.save()
       
        return report


class AuctionReportSerializer(serializers.Serializer): 
    id = serializers.CharField(read_only=True)
    auction_id = serializers.CharField(write_only=True, required=True) 
    issue_details = serializers.CharField(required=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        user = self.context["request"].user

        auction_id = validated_data.pop("auction_id")
        try:
            auction = Auction.objects.get(id=ObjectId(auction_id))
        except Auction.DoesNotExist:
            raise serializers.ValidationError({"auction_id": "Auction not found."})

        try:
            user_obj = User.objects.get(id=ObjectId(user.id))
        except User.DoesNotExist:
            raise serializers.ValidationError({"user": "User not found."})

        existing = AuctionReport.objects(auction=auction, user=user_obj).first()
        if existing:
            raise serializers.ValidationError({"error": "You already reported this auction."})

        report = AuctionReport(
            user=user_obj,
            auction=auction,
            issue_details=validated_data["issue_details"],
        )
        report.save()
        return report

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "issue_details": instance.issue_details,
            "status": instance.status,
            "created_at": instance.created_at,
        }

