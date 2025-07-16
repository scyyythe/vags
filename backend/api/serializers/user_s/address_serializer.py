from rest_framework import serializers
from api.models.user_model.address import Address

class AddressSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = serializers.CharField(read_only=True)

    name = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    country = serializers.CharField()
    postal_code = serializers.CharField()
    phone = serializers.CharField()
    is_default = serializers.BooleanField()

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate(self, data):
        required_fields = [
            "name", "address", "city", "state", "country", "postal_code", "phone"
        ]
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        return data

    def create(self, validated_data):
        return Address(**validated_data).save()

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
