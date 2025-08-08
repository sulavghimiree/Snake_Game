from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """Custom user model with additional fields"""
    email = models.EmailField(unique=True)
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    total_games_played = models.IntegerField(default=0)
    best_score = models.IntegerField(default=0)
    
    # Profile fields
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    favorite_score = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def mark_online(self):
        self.is_online = True
        self.last_activity = timezone.now()
        self.save()

    def mark_offline(self):
        self.is_online = False
        self.save()

    @classmethod
    def get_online_users(cls):
        # Users are considered online if they were active in the last 5 minutes
        cutoff_time = timezone.now() - timedelta(minutes=5)
        return cls.objects.filter(
            models.Q(is_online=True) | 
            models.Q(last_activity__gte=cutoff_time)
        ).distinct()


class GameSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_sessions')
    score = models.IntegerField(default=0)
    game_data = models.JSONField(default=dict)  # Store game state
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"{self.user.username} - Score: {self.score}"

    def end_game(self):
        self.is_active = False
        self.ended_at = timezone.now()
        self.save()
        
        # Update user stats
        self.user.total_games_played += 1
        if self.score > self.user.best_score:
            self.user.best_score = self.score
        self.user.save()


class HighScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='high_scores')
    score = models.IntegerField()
    date_achieved = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-date_achieved']

    def __str__(self):
        return f"{self.user.username}: {self.score}"


class OnlinePlayer(models.Model):
    """Track currently online players"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='online_status')
    last_ping = models.DateTimeField(auto_now=True)
    current_game = models.ForeignKey(GameSession, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['user__username']

    def __str__(self):
        return f"{self.user.username} - Online"

    @classmethod
    def cleanup_offline_players(cls):
        """Remove players who haven't pinged in the last 2 minutes"""
        cutoff_time = timezone.now() - timedelta(minutes=2)
        cls.objects.filter(last_ping__lt=cutoff_time).delete()

    @classmethod
    def get_online_count(cls):
        cls.cleanup_offline_players()
        return cls.objects.count()

    @classmethod
    def get_online_players(cls):
        cls.cleanup_offline_players()
        return cls.objects.select_related('user', 'current_game').all()
