from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, GameSession, HighScore, OnlinePlayer


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'is_online', 'total_games_played', 'best_score', 'last_activity']
    list_filter = ['is_online', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email']
    readonly_fields = ['last_activity', 'date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Game Stats', {
            'fields': ('is_online', 'total_games_played', 'best_score', 'last_activity')
        }),
    )


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'is_active', 'created_at', 'ended_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at', 'ended_at']
    raw_id_fields = ['user']


@admin.register(HighScore)
class HighScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'date_achieved']
    list_filter = ['date_achieved']
    search_fields = ['user__username']
    readonly_fields = ['date_achieved']
    raw_id_fields = ['user']


@admin.register(OnlinePlayer)
class OnlinePlayerAdmin(admin.ModelAdmin):
    list_display = ['user', 'last_ping', 'current_game_score']
    list_filter = ['last_ping']
    search_fields = ['user__username']
    readonly_fields = ['last_ping']
    raw_id_fields = ['user', 'current_game']
    
    def current_game_score(self, obj):
        if obj.current_game and obj.current_game.is_active:
            return obj.current_game.score
        return "No active game"
    current_game_score.short_description = "Current Game Score"
