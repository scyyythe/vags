from mongoengine import Document, StringField, DateTimeField, EmailField, IntField, BooleanField,URLField,ListField,ReferenceField
from datetime import datetime,timedelta
import bcrypt
from mongoengine.queryset import Q

class User(Document):
    username = StringField(max_length=150, unique=True, required=True)
    password = StringField(required=False, null=True)
    email = EmailField(unique=True, required=True)
    first_name = StringField(max_length=100, required=False)
    last_name = StringField(max_length=100, required=False)
    role = StringField(max_length=100, default="User")
    user_status = StringField(max_length=100, default="Active")
    created_at = DateTimeField(default=datetime.utcnow) 
    updated_at = DateTimeField(default=datetime.utcnow)  
    otp = IntField(required=False) 
    is_oauth_user = BooleanField(default=False)
    registered_via = StringField(choices=["google", "email", "other"], required=False)

    
    profile_picture = URLField(required=False)  
    cover_photo=URLField(required=False)  
    bio = StringField(required=False)  
    contact_number = StringField(required=False)  
    address = StringField(required=False) 
    gender = StringField(choices=["Male", "Female", "Other"], required=False)  
    date_of_birth = DateTimeField(required=False)  

    blocked_users = ListField(ReferenceField('User'))
    
    def set_password(self, password):
         self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        if not self.password:
            return False  
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_staff(self):
        return self.role == "Admin"
    
    def get_active_suspension(self):
        from api.models.admin.suspension.suspension_model import Suspension

        now = datetime.utcnow()
        return Suspension.objects(user=self, start_date__lte=now, end_date__gte=now).first()

    @property
    def is_suspended(self):
        return self.get_active_suspension() is not None

    @property
    def is_banned(self):
        from api.models.admin.ban.ban_model import Ban

        now = datetime.utcnow()
        active_ban = Ban.objects(
            user=self,
            start_date__lte=now,
            __raw__={"$or": [
                {"is_permanent": True},
                {"end_date": {"$gte": now}}
            ]}
        ).first()
        return active_ban is not None


