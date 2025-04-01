from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    fingerprint_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
