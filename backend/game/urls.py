from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GameViewSet,
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    OnlinePlayersView,
    PingView,
    ProfilePhotoUploadView,
    AllUsersView
)
from .google_auth import google_auth

router = DefaultRouter()
router.register(r'games', GameViewSet, basename='games')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/logout/', UserLogoutView.as_view(), name='logout'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/google/', google_auth, name='google-auth'),
    
    # Profile endpoints
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user-profile'),
    path('profile/photo/upload/', ProfilePhotoUploadView.as_view(), name='profile-photo-upload'),
    path('users/', AllUsersView.as_view(), name='all-users'),
    
    # Online players
    path('online-players/', OnlinePlayersView.as_view(), name='online-players'),
    path('ping/', PingView.as_view(), name='ping'),
    
    # Game endpoints
    path('', include(router.urls)),
]
