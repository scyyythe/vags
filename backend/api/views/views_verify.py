from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .verify import read_fingerprint_from_arduino_for_verification

class TriggerFingerprintScanView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            arduino_port = 'COM3'  # Update to your specific port if necessary
            verification_result = read_fingerprint_from_arduino_for_verification(arduino_port)

            print(f"Verification result: {verification_result}")  # Log the result

            if verification_result["status"] == "matched":
                return Response({"status": "success", "result": "matched"}, status=status.HTTP_200_OK)

            return Response({"status": "failed", "result": verification_result["result"]}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
