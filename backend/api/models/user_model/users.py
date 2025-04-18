from mongoengine import Document, StringField, DateTimeField, EmailField
from datetime import datetime, timedelta
import bcrypt
import random
import string

class User(Document):
    username = StringField(max_length=150, unique=True, required=True)
    password = StringField(required=True)
    email = EmailField(unique=True, required=True)
    first_name = StringField(max_length=100, required=False)
    last_name = StringField(max_length=100, required=False)
    role = StringField(max_length=100, default="User")
    user_status = StringField(max_length=100, default="Active")
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    otp = StringField(max_length=6, required=False) 
    otp_expires_at = DateTimeField(required=False)  
    def set_password(self, password):
         self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False
