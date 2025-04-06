import serial
import time

# Set up serial communication with the Arduino (or your fingerprint sensor)
arduino = serial.Serial('COM3', 115200)  # Replace 'COM3' with your actual port
time.sleep(2)  # Wait for Arduino to initialize

# Main logic to check for fingerprint match
while True:
    if arduino.in_waiting > 0:
        status = arduino.readline().decode('utf-8').strip()  # Read data from serial
        if status in ['matched', 'not matched']:
            print(status)  # Output result to capture in Django
            break  # Stop once status is received
    time.sleep(1)  # Polling interval to check serial data
