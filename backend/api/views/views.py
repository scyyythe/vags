from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class FingerprintStatusView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        status_value = request.data.get('status')  # The status from the fingerprint sensor

        # Check if the status is valid
        if status_value not in ['matched', 'not matched']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle matched fingerprint status
        if status_value == "matched":
            return Response({
                'status': 'success', 
                'message': 'Fingerprint matched'
            }, status=status.HTTP_200_OK)

        # Handle non-matched fingerprint status
        return Response({
            'status': 'failure', 
            'message': 'Fingerprint did not match'
        }, status=status.HTTP_200_OK)
