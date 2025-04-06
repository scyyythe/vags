import serial
import json
import time
import sys

def read_fingerprint_from_arduino(arduino_port, user_info):
    """Connect to Arduino, send enroll command, and listen for a response."""
    ser = serial.Serial(arduino_port, 115200, timeout=5)  # Ensure baud rate matches Arduino
    time.sleep(2)  # Wait for Arduino to initialize

    ser.flushInput()  # Clears the serial buffer
    ser.write(b'ENROLL\n')  # Send fingerprint enrollment command
    print("Sent enrollment command to Arduino...")

    enrolled_fingerprint = None
    while True:
        line = ser.readline().decode('latin-1', errors='ignore').strip()
        if line:
            print(f"Arduino: {repr(line)}")

        if "Fingerprint enrolled successfully#" in line:
            fingerprint_id = int(line.split("#")[-1])  # Extract fingerprint ID
            enrolled_fingerprint = {
                "fingerprint_id": fingerprint_id,
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "email": user_info["email"],
                "status": "enrolled"
            }
            break  # Exit loop when enrollment is successful

        if "Fingerprint enrollment failed" in line:
            enrolled_fingerprint = {"status": "failed"}
            break  # Exit loop on failure

    ser.close()
    return enrolled_fingerprint

def save_fingerprint_to_json(fingerprint_data, filename='fingerprints.json'):
    """Save the fingerprint data along with user info to a JSON file."""
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    # Debugging to see what data is being appended
    print(f"Appending fingerprint data: {fingerprint_data}")
    
    data.append(fingerprint_data)

    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def enroll_fingerprint(user_info, arduino_port='COM3'):
    """Enroll the fingerprint and save the data to JSON."""
    fingerprint_data = read_fingerprint_from_arduino(arduino_port, user_info)
    if fingerprint_data:
        print(f"Saving fingerprint data: {fingerprint_data}")
        save_fingerprint_to_json(fingerprint_data)
        return fingerprint_data
    else:
        print("Fingerprint enrollment failed.")
        return None
