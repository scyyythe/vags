
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.utils.cloudinary_signature import generate_cloudinary_signature


class CloudinarySignatureView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        
        try:
            signature_data = generate_cloudinary_signature()
            return Response(signature_data, status=200)
        except Exception as e:
            return Response(
                {"error": "Failed to generate signature"}, 
                status=500
            )
