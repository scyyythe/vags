
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os
import sys
from mongoengine import connect
from django.conf import settings
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.http import JsonResponse
from corsheaders.defaults import default_headers

load_dotenv() 

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)
# MongoDB connection (always run this)
connect(
    db=os.getenv("MONGO_DB_NAME"),
    host=os.getenv("MONGO_DB_URI"),
    alias="default"
)

# Optional: test the connection in dev only
if "runserver" in sys.argv or "shell" in sys.argv:
    print("✅ MongoDB Connected in Dev Mode")

        

BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-gtf0y@$4m-u=t$b-&z8woymqzjq47-x=s5k)^#d=-v!+yqo(%^")

# SECRET_KEY = 'django-insecure-gtf0y@$4m-u=t$b-&z8woymqzjq47-x=s5k)^#d=-v!+yqo(%^'

# SECURITY WARNING: don't run with debug turned on in production!

ALLOWED_HOSTS = ["vags.onrender.com", "vags.vercel.app", "localhost", "127.0.0.1"]


DEBUG = True

AUTHENTICATION_BACKENDS = (
    'mongoengine.django.auth.MongoEngineBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.auth.authentication.MongoJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

}


SIMPLE_JWT = {
     "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
     "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
 }

# # Application definition
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
INSTALLED_APPS = [ 
    'corsheaders', 
    'anymail',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api',
    'rest_framework',
    'rest_framework_simplejwt',
    'channels',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',  
       
]
SITE_ID = 1
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',  
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

ASGI_APPLICATION = 'backend.asgi.application'


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('localhost', 6379)],  
        },
    },
}



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://vags.vercel.app",
    "http://localhost:8080", 
    "http://192.168.100.31:8080",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "content-type",
]

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "OPTIONS",
    "PUT",
    "PATCH",
    "DELETE",
]

CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken", "Authorization"]

CSRF_TRUSTED_ORIGINS = [
    "https://vags.vercel.app",
]


# python manage.py runserver 0.0.0.0:8000
# python manage.py runserver 0.0.0.0:8080

# settings.py

# Redirects
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'


SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'APP': {
            'client_id': os.getenv('GOOGLE_OAUTH_CLIENT_ID'),
            'secret': os.getenv('GOOGLE_OAUTH_CLIENT_SECRET'),
            'key': ''
        }
    }
    }
# # CACHES = {
# #     "default": {
# #         "BACKEND": "django_redis.cache.RedisCache",
# #        "LOCATION": "redis://redis:6379/1",  
# #         "OPTIONS": {
# #             "CLIENT_CLASS": "django_redis.client.DefaultClient",
# #         }
# #     }
# }
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#         },
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'DEBUG',
#     },
# }

DEBUT=False


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.mailtrap.io"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "52cba4e6377381"  
EMAIL_HOST_PASSWORD = "4ffe0c89c35ce9" 
DEFAULT_FROM_EMAIL = "worxist_gallery@example.com"  
