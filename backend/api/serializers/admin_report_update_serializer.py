from rest_framework import serializers
from api.models.report import Report

class AdminReportUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["Pending", "In Progress", "Resolved"])

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
