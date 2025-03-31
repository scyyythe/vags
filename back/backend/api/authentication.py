from rest_framework_simplejwt.authentication import JWTAuthentication
from api.models.users import User
from bson import ObjectId

class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """
        Overrides get_user to retrieve a MongoEngine User.
        """
        user_id = validated_token.get("user_id")
        if user_id is None:
            return None
        
        try:
            mongo_user = User.objects.get(id=ObjectId(user_id))
        except Exception:
            return None
        return mongo_user
