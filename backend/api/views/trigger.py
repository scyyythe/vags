import subprocess
import sys
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import os
class TriggerFingerprintScanView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            django_python = sys.executable  # Check Python path
            script_path = os.path.abspath("D:/vags_main/vags/backend/api/views/fingerprint_status.py")

            print(f"Django Python: {django_python}")
            print(f"Running script: {script_path}")

            result = subprocess.run([django_python, script_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            print(f"Subprocess Output: {result.stdout.strip()}")
            print(f"Subprocess Error: {result.stderr.strip()}")

            scan_result = result.stdout.strip()
            
            if scan_result == "matched":
                return Response({'status': 'success', 'result': 'matched'}, status=status.HTTP_200_OK)
            else:
                return Response({'status': 'failure', 'result': 'not matched'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error triggering fingerprint scan: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)