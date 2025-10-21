from rest_framework import serializers
from bson import ObjectId
from api.models.admin.report import Report
from api.models.artwork_model.bid import Auction
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.exhibit_model.exhibit import Exhibit
from api.models.interaction_model.comment import Comment


class ReportSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)

    art_id = serializers.CharField(write_only=True, required=False)
    auction_id = serializers.CharField(write_only=True, required=False)
    exhibit_id = serializers.CharField(write_only=True, required=False)  # ✅ NEW
    comment_id = serializers.CharField(write_only=True, required=False)
    reported_user_id = serializers.CharField(write_only=True, required=False)

    category = serializers.CharField(required=True)
    option = serializers.CharField(required=False, allow_blank=True)
    issue_details = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    additionalInfo = serializers.CharField(source="additional_info", required=False, allow_blank=True)

    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def validate(self, data):
        art_id = data.get("art_id")
        auction_id = data.get("auction_id")
        exhibit_id = data.get("exhibit_id")
        comment_id = data.get("comment_id")
        reported_user_id = data.get("reported_user_id")

        if not any([art_id, auction_id, exhibit_id, comment_id, reported_user_id]):
            raise serializers.ValidationError(
                "You must provide at least one of art_id, auction_id, exhibit_id, comment_id, or reported_user_id."
            )
        return data

    def create(self, validated_data):
        art_id = validated_data.pop("art_id", None)
        auction_id = validated_data.pop("auction_id", None)
        exhibit_id = validated_data.pop("exhibit_id", None)
        comment_id = validated_data.pop("comment_id", None)
        reported_user_id = validated_data.pop("reported_user_id", None)

        category = validated_data.get("category")
        option = validated_data.get("option", "")
        description = validated_data.get("description") or validated_data.get("issue_details", "")
        additional_info = validated_data.get("additional_info", "")

        request_user = self.context["request"].user
        try:
            user_obj = User.objects.get(id=ObjectId(request_user.id))
        except User.DoesNotExist:
            raise serializers.ValidationError({"user": "User not found."})

        art = auction = exhibit = comment = reported_user = None

        if art_id:
            try:
                art = Art.objects.get(id=ObjectId(art_id))
            except Art.DoesNotExist:
                raise serializers.ValidationError({"art_id": "Artwork not found."})
            existing_report = Report.objects.filter(
                user=user_obj,
                art=art,
                status__in=["Pending", "In Progress"],
            ).first()
            if existing_report:
                raise serializers.ValidationError({
                    "detail": "You have already reported this artwork and it's still under review."
                })

        if auction_id:
            try:
                auction = Auction.objects.get(id=ObjectId(auction_id))
            except Auction.DoesNotExist:
                raise serializers.ValidationError({"auction_id": "Auction not found."})
            existing_report = Report.objects.filter(
                user=user_obj,
                auction=auction,
                status__in=["Pending", "In Progress"],
            ).first()
            if existing_report:
                raise serializers.ValidationError({
                    "detail": "You have already reported this auction and it's still under review."
                })

        if exhibit_id:
            try:
                exhibit = Exhibit.objects.get(id=ObjectId(exhibit_id))
            except Exhibit.DoesNotExist:
                raise serializers.ValidationError({"exhibit_id": "Exhibit not found."})
            existing_report = Report.objects.filter(
                user=user_obj,
                exhibit=exhibit,
                status__in=["Pending", "In Progress"],
            ).first()
            if existing_report:
                raise serializers.ValidationError({
                    "detail": "You have already reported this exhibit and it's still under review."
                })

        if comment_id:
            try:
                comment = Comment.objects.get(id=ObjectId(comment_id))
            except Comment.DoesNotExist:
                raise serializers.ValidationError({"comment_id": "Comment not found."})
            existing_report = Report.objects.filter(
                user=user_obj,
                comment=comment,
                status__in=["Pending", "In Progress"],
            ).first()
            if existing_report:
                raise serializers.ValidationError({
                    "detail": "You have already reported this comment and it's still under review."
                })

        if reported_user_id:
            try:
                reported_user = User.objects.get(id=ObjectId(reported_user_id))
            except User.DoesNotExist:
                raise serializers.ValidationError({"reported_user_id": "User not found."})
            existing_report = Report.objects.filter(
                user=user_obj,
                reported_user=reported_user,
                status__in=["Pending", "In Progress"],
            ).first()
            if existing_report:
                raise serializers.ValidationError({
                    "detail": "You have already reported this user and it's still under review."
                })

        report = Report(
            user=user_obj,
            art=art,
            auction=auction,
            exhibit=exhibit,
            comment=comment,
            reported_user=reported_user,
            category=category,
            option=option,
            description=description,
            additional_info=additional_info,
        )
        report.save()
        return report
