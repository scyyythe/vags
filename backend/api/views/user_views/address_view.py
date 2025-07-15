from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from bson import ObjectId
from bson.errors import InvalidId
from django.http import Http404
from api.models.user_model.address import Address
from api.serializers.user_s.address_serializer import AddressSerializer

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects(user=self.request.user)

    def get_object(self):
        try:
            object_id = ObjectId(self.kwargs["pk"])
        except InvalidId:
            raise Http404("Invalid address ID")

        try:
            return Address.objects.get(id=object_id, user=self.request.user)
        except Address.DoesNotExist:
            raise Http404("Address not found")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='default')
    def get_default_address(self, request):
        address = Address.objects(user=request.user, is_default=True).first()
        if not address:
            return Response({"detail": "No default address."}, status=404)
        return Response(AddressSerializer(address).data)
