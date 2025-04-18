import subprocess
import json
from django.http import JsonResponse
from .enroll import enroll_fingerprint

def trigger_fingerprint_scan(request):
    """Handles the fingerprint scan request and triggers enrollment."""
    if request.method == "POST":
        try:
            # Get the user info (firstName, lastName, email) from the request body
            user_info = json.loads(request.body.decode('utf-8'))    
            print("Received user info:", user_info)

            # Enroll the fingerprint and save to JSON
            fingerprint_data = enroll_fingerprint(user_info)

            if fingerprint_data:
                return JsonResponse({'status': 'success', 'result': 'matched', 'data': fingerprint_data}, status=200)
            else:
                return JsonResponse({'status': 'error', 'result': 'Fingerprint enrollment failed'}, status=500)

        except Exception as e:
            # Catch any errors and log them
            print(f"Error: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

