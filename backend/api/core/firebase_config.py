import os
import firebase_admin
from firebase_admin import credentials

firebase_app = None

def initialize_firebase():
    global firebase_app
    if firebase_app:
        return firebase_app

    cred_path = os.getenv("FIREBASE_CREDENTIALS")
    if not cred_path:
        raise ValueError("FIREBASE_CREDENTIALS is not set in .env")

    abs_path = os.path.join(os.getcwd(), cred_path.replace("/", os.sep))
    if not os.path.exists(abs_path):
        raise ValueError(f"Firebase credentials file not found: {abs_path}")

    cred = credentials.Certificate(abs_path)
    firebase_app = firebase_admin.initialize_app(cred)
    return firebase_app
