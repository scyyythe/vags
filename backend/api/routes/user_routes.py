from django.urls import path
from api.views.user_views.user_views import RetrieveUserView, UpdateUserView, DeleteUserView

user_urlpatterns = [
    path('user/<str:pk>/', RetrieveUserView.as_view(), name='retrieve_user'),
    path('user/<str:pk>/update/', UpdateUserView.as_view(), name='update_user'),
    path('user/<str:pk>/delete/', DeleteUserView.as_view(), name='delete_user'),
]
