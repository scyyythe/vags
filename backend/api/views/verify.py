import serial
import time
def read_fingerprint_from_arduino_for_verification(arduino_port):
    """Connect to Arduino, send verify command, and listen for a response."""
    ser = None
    try:
        # Open the serial port
        ser = serial.Serial(arduino_port, 115200, timeout=5)  # Adjust the baud rate if needed
        time.sleep(2)  # Allow Arduino to initialize

        ser.flushInput()  # Clear the serial input buffer

        # Send verification command to Arduino
        ser.write(b'VERIFY\n')
        print("Sent verification command to Arduino...")

        verified_fingerprint = None
        start_time = time.time()  # Start time to prevent hanging indefinitely

        # Continuously read data from Arduino
        while True:
            if time.time() - start_time > 10:  # Timeout after 10 seconds
                print("Timeout reached, closing serial port.")
                break

            line = ser.readline().decode('latin-1', errors='ignore').strip()
            if line:
                print(f"Arduino: {repr(line)}")

            if "Fingerprint matched with ID:" in line:
                fingerprint_id = int(line.split(":")[-1].strip())  # Extract matching fingerprint ID
                verified_fingerprint = {
                    "fingerprint_id": fingerprint_id,
                    "status": "matched"
                }
                break  # Exit loop on successful match

            if "Fingerprint not recognized" in line or "Fingerprint not found" in line:
                verified_fingerprint = {"status": "failed", "result": "Fingerprint not found"}
                break  # Exit loop on failure

        # If no fingerprint was recognized or a timeout occurred, ensure we return a failure message
        if not verified_fingerprint:
            verified_fingerprint = {"status": "failed", "result": "No data received from fingerprint sensor"}

        return verified_fingerprint

    except serial.SerialException as e:
        print(f"Error with serial connection: {e}")
        return {"status": "failed", "result": "Error with serial connection"}

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"status": "failed", "result": "Unexpected error"}

    finally:
        # Always ensure the serial port is closed
        if ser:
            print("Closing serial port...")
            ser.close()


def main():
    arduino_port = 'COM3'  # Update to your specific port if necessary

    while True:
        print("Verifying fingerprint...")
        fingerprint_data = read_fingerprint_from_arduino_for_verification(arduino_port)
        if fingerprint_data:
            if fingerprint_data["status"] == "matched":
                print(f"Fingerprint matched! Fingerprint ID: {fingerprint_data['fingerprint_id']}")
                break  # Exit loop on successful match
            else:
                print(f"Fingerprint not recognized. Reason: {fingerprint_data['result']}")
                user_input = input("Do you want to try again? (y/n): ").strip().lower()
                if user_input != 'y':
                    print("Exiting verification process.")
                    break  # Exit loop if user doesn't want to try again
        else:
            print("No fingerprint data received.")
            user_input = input("Do you want to try again? (y/n): ").strip().lower()
            if user_input != 'y':
                print("Exiting verification process.")
                break  # Exit loop if user doesn't want to try again

if __name__ == '__main__':
    main()
