from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
import logging
import requests as http_requests
import os
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
User = get_user_model()

def download_google_profile_picture(user, picture_url):
    """
    Download and save Google profile picture for user
    """
    if not picture_url:
        return False
    
    try:
        # Try to get a higher resolution version of the Google profile picture
        # Google profile pictures can be resized by replacing s96-c with s400-c or removing size parameter
        high_res_url = picture_url.replace('s96-c', 's400-c').replace('=s96-c', '=s400-c')
        if '=s' not in high_res_url and 's96-c' not in high_res_url:
            # If no size parameter found, try to add one for higher resolution
            if '?' in high_res_url:
                high_res_url += '&sz=400'
            else:
                high_res_url += '?sz=400'
        
        # Download the image
        response = http_requests.get(high_res_url, timeout=10)
        if response.status_code == 200:
            # Get file extension from URL or default to jpg
            file_extension = '.jpg'  # Google profile pics are usually JPG
            
            # Create filename
            filename = f"google_profile_{user.id}_{user.username}{file_extension}"
            
            # Save the image to user's profile_photo field
            user.profile_photo.save(
                filename,
                ContentFile(response.content),
                save=True
            )
            logger.info(f"Downloaded Google profile picture (high-res) for user: {user.username}")
            return True
    except Exception as e:
        logger.error(f"Failed to download Google profile picture: {e}")
        # Try with original URL as fallback
        try:
            response = http_requests.get(picture_url, timeout=10)
            if response.status_code == 200:
                filename = f"google_profile_{user.id}_{user.username}.jpg"
                user.profile_photo.save(
                    filename,
                    ContentFile(response.content),
                    save=True
                )
                logger.info(f"Downloaded Google profile picture (fallback) for user: {user.username}")
                return True
        except Exception as e2:
            logger.error(f"Fallback download also failed: {e2}")
    
    return False

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate user with Google OAuth token
    """
    try:
        # Accept both 'token' and 'credential' fields for compatibility
        token = request.data.get('token') or request.data.get('credential')
        if not token:
            return Response(
                {'error': 'Google token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the Google token
        try:
            # Log the client ID for debugging (first few chars only for security)
            client_id = settings.GOOGLE_OAUTH2_CLIENT_ID
            logger.info(f"Using Google Client ID: {client_id[:10]}..." if client_id else "No Google Client ID configured")
            
            if not client_id:
                return Response(
                    {'error': 'Google OAuth not configured on server'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                client_id
            )

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            # Get user info from Google
            google_id = idinfo['sub']
            email = idinfo['email']
            name = idinfo['name']
            picture = idinfo.get('picture', '')
            
            logger.info(f"Google auth attempt for email: {email}")

        except ValueError as e:
            logger.error(f"Invalid Google token: {e}")
            return Response(
                {'error': 'Invalid Google token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to find existing user by email
        user = None
        try:
            user = User.objects.get(email=email)
            logger.info(f"Found existing user: {user.username}")
            
            # Always try to update profile picture from Google (in case user changed it)
            if picture:
                download_google_profile_picture(user, picture)
                
        except User.DoesNotExist:
            # Create new user
            username = email.split('@')[0]
            # Make sure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=name.split(' ')[0] if name else '',
                last_name=' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else '',
            )
            logger.info(f"Created new user: {user.username}")
            
            # Download Google profile picture for new user
            if picture:
                download_google_profile_picture(user, picture)

        # Mark user as online
        user.mark_online()

        # Get or create token
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'success': True,
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile_photo_url': user.profile_photo.url if user.profile_photo else None,
                'bio': user.bio,
                'location': user.location,
                'favorite_score': user.favorite_score,
                'is_online': user.is_online,
                'best_score': user.best_score,
                'total_games_played': user.total_games_played,
            }
        })

    except Exception as e:
        logger.error(f"Google auth error: {e}")
        return Response(
            {'error': 'Authentication failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
