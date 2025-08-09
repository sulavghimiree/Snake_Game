from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.db.models import Q
from django.utils import timezone
from .models import User, GameSession, HighScore, OnlinePlayer
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer, 
    UserProfileSerializer,
    OnlinePlayerSerializer,
    GameSessionSerializer, 
    HighScoreSerializer, 
    UpdateGameSerializer
)
import random


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            # Mark user as online
            user.mark_online()
            
            # Create or update online player record
            online_player, created = OnlinePlayer.objects.get_or_create(user=user)
            online_player.last_ping = timezone.now()
            online_player.save()
            
            return Response({
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'token': token.key,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    def post(self, request):
        try:
            # Mark user as offline
            request.user.mark_offline()
            
            # Remove from online players
            OnlinePlayer.objects.filter(user=request.user).delete()
            
            # Delete token
            request.user.auth_token.delete()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Logout failed'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OnlinePlayersView(APIView):
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(5))
    def get(self, request):
        # Only return online players if user is authenticated
        if request.user.is_authenticated:
            online_players = OnlinePlayer.get_online_players()
            # Minimal fields by default to reduce payload; override with ?fields=id,username,...
            default_fields = ['id', 'username', 'best_score', 'total_games_played']
            context = {'request': request, 'only_fields': default_fields}
            serializer = OnlinePlayerSerializer(online_players, many=True, context=context)
            return Response(serializer.data)
        else:
            # Return empty list for unauthenticated users
            return Response([])


class PingView(APIView):
    """Endpoint for keeping user online status updated"""
    
    def post(self, request):
        user = request.user
        user.mark_online()
        
        # Update online player record
        online_player, created = OnlinePlayer.objects.get_or_create(user=user)
        online_player.last_ping = timezone.now()
        
        # Update current game if provided
        current_game_id = request.data.get('current_game_id')
        if current_game_id:
            try:
                game = GameSession.objects.get(id=current_game_id, user=user)
                online_player.current_game = game
            except GameSession.DoesNotExist:
                pass
                
        online_player.save()
        
        return Response({'status': 'pong'})


class GameViewSet(viewsets.ModelViewSet):
    serializer_class = GameSessionSerializer

    def get_queryset(self):
        return GameSession.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def start_game(self, request):
        """Start a new game session"""
        user = request.user
        
        # End any active games for this user
        GameSession.objects.filter(user=user, is_active=True).update(is_active=False)
        
        # Initial game state
        initial_state = {
            'snake': [[10, 10], [10, 11], [10, 12]],
            'food': [random.randint(0, 19), random.randint(0, 19)],
            'direction': 'up',
            'score': 0,
            'game_over': False
        }
        
        game_session = GameSession.objects.create(
            user=user,
            score=0,
            game_data=initial_state
        )
        
        # Update online player's current game
        online_player, created = OnlinePlayer.objects.get_or_create(user=user)
        online_player.current_game = game_session
        online_player.save()
        
        return Response({
            'game_id': game_session.id,
            'game_state': initial_state,
            'message': 'Game started successfully'
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_game(self, request, pk=None):
        """Update game state"""
        try:
            game_session = self.get_object()
            if not game_session.is_active:
                return Response({
                    'error': 'Game session is not active'
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = UpdateGameSerializer(data=request.data)
            if serializer.is_valid():
                game_data = serializer.validated_data['game_data']
                score = serializer.validated_data['score']
                
                game_session.game_data = game_data
                game_session.score = score
                
                # Check if game is over
                if game_data.get('game_over', False):
                    game_session.end_game()
                    # Save high score if it's a new record
                    self._save_high_score(request.user, score)
                    
                    # Clear current game from online player
                    try:
                        online_player = OnlinePlayer.objects.get(user=request.user)
                        online_player.current_game = None
                        online_player.save()
                    except OnlinePlayer.DoesNotExist:
                        pass
                
                game_session.save()
                
                return Response({
                    'game_state': game_data,
                    'score': score,
                    'message': 'Game updated successfully'
                }, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except GameSession.DoesNotExist:
            return Response({
                'error': 'Game session not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def end_game(self, request, pk=None):
        """End a game session"""
        try:
            game_session = self.get_object()
            game_session.end_game()
            
            # Save high score
            self._save_high_score(request.user, game_session.score)
            
            # Clear current game from online player
            try:
                online_player = OnlinePlayer.objects.get(user=request.user)
                online_player.current_game = None
                online_player.save()
            except OnlinePlayer.DoesNotExist:
                pass
            
            return Response({
                'message': 'Game ended successfully',
                'final_score': game_session.score
            }, status=status.HTTP_200_OK)
            
        except GameSession.DoesNotExist:
            return Response({
                'error': 'Game session not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    @method_decorator(cache_page(10))
    def high_scores(self, request):
        """Get top 10 high scores - one per user"""
        # Get highest score for each user, ordered by score descending
        from django.db.models import Max
        
        # Get the best score for each user
        user_best_scores = HighScore.objects.values('user').annotate(
            best_score=Max('score')
        ).order_by('-best_score')[:10]
        
        # Get the actual HighScore objects for these user/score combinations
        high_scores = []
        for item in user_best_scores:
            high_score = HighScore.objects.filter(
                user=item['user'], 
                score=item['best_score']
            ).first()
            if high_score:
                high_scores.append(high_score)
        
        # Minimal fields for leaderboard
        default_fields = ['user_id', 'username', 'score', 'profile_photo_url']
        serializer = HighScoreSerializer(high_scores, many=True, context={'request': request, 'only_fields': default_fields})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def me_summary(self, request):
        """Lightweight user summary for header widgets"""
        fields = request.query_params.get('fields')
        default_fields = ['id', 'username', 'best_score', 'total_games_played', 'is_online']
        context = {'request': request}
        if not fields:
            context['only_fields'] = default_fields
        serializer = UserProfileSerializer(request.user, context=context)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def generate_food(self, request):
        """Generate random food position"""
        x = random.randint(0, 19)  # Assuming 20x20 grid
        y = random.randint(0, 19)
        return Response({'food': [x, y]})

    def _save_high_score(self, user, score):
        """Save high score - only keep the best score per user"""
        # Get or create high score for this user
        existing_score = HighScore.objects.filter(user=user).first()
        
        if existing_score:
            # Update only if new score is higher
            if score > existing_score.score:
                existing_score.score = score
                existing_score.date_achieved = timezone.now()
                existing_score.save()
        else:
            # Create new high score for this user
            HighScore.objects.create(user=user, score=score)


class UserProfileView(APIView):
    """View and update user profiles"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id=None):
        """Get user profile - own profile or another user's profile"""
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user
        
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        """Update own profile"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfilePhotoUploadView(APIView):
    """Handle profile photo uploads"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Upload profile photo"""
        if 'profile_photo' not in request.FILES:
            return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.profile_photo = request.FILES['profile_photo']
        user.save()
        
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response({
            'message': 'Profile photo updated successfully',
            'profile_photo': serializer.data.get('profile_photo_url')
        })


class AllUsersView(APIView):
    """Get all users for browsing profiles"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.all().order_by('-best_score', '-total_games_played')
        serializer = UserProfileSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)
