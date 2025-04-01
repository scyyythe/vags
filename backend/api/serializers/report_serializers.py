from rest_framework import serializers
from api.models.report import Report

class ReportSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    issue_details = serializers.CharField(required=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        report = Report(**validated_data)
        report.save()
        return report

    def update(self, instance, validated_data):
       
        instance.issue_details = validated_data.get("issue_details", instance.issue_details)
        instance.save()
        return instance

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "issue_details": instance.issue_details,
            "status": instance.status,
            "created_at": instance.created_at
        }
