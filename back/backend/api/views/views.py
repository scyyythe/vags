import serial
import time
from django.http import JsonResponse

SERIAL_PORT = "COM3"  # Update with the correct port
BAUD_RATE = 9600

def fingerprint_login(request):
    try:
        # Open serial port
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=5)
        time.sleep(2)  # Wait for Arduino to initialize

        ser.write(b"scan\n")  # Send command to Arduino to start the scan
        response = ser.readline().decode("utf-8").strip()  # Read Arduino's response

        # Log the Arduino response
        print(f"Arduino Response: {response}")

        # If Arduino returns '1', login is successful
        if response == "1":
            return JsonResponse({"success": True, "message": "Fingerprint scanned successfully. Logging you in."})
        else:
            return JsonResponse({"success": False, "message": "Fingerprint scan failed."})

    except Exception as e:
        print(f"Error: {str(e)}")
        return JsonResponse({"success": False, "message": "Error connecting to fingerprint scanner."})
