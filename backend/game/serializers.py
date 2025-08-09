from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, GameSession, HighScore, OnlinePlayer


class SparseFieldsMixin:
    """Allow selecting a subset of fields via context['only_fields'] or request ?fields=a,b"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        only_fields = None
        # Prefer explicit context
        ctx_fields = (self.context or {}).get('only_fields') if hasattr(self, 'context') else None
        if ctx_fields:
            only_fields = set(ctx_fields)
        else:
            request = (self.context or {}).get('request') if hasattr(self, 'context') else None
            if request:
                param = request.query_params.get('fields')
                if param:
                    only_fields = set([f.strip() for f in param.split(',') if f.strip()])
        if only_fields:
            allowed = set(only_fields)
            existing = set(getattr(self.Meta, 'fields', []))
            # Intersect with defined fields only
            self.fields = {k: v for k, v in self.fields.items() if k in allowed and k in existing}


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password.')


class UserProfileSerializer(SparseFieldsMixin, serializers.ModelSerializer):
    profile_photo_url = serializers.SerializerMethodField()
    join_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'date_joined', 'join_date_formatted',
            'total_games_played', 'best_score', 'is_online', 'last_activity',
            'profile_photo', 'profile_photo_url', 'bio', 'favorite_score', 'location'
        ]
        read_only_fields = [
            'id', 'date_joined', 'join_date_formatted', 'total_games_played', 
            'best_score', 'is_online', 'last_activity', 'profile_photo_url'
        ]
        extra_kwargs = {
            'email': {'write_only': True}  # Don't expose email to other users
        }
    
    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None
    
    def get_join_date_formatted(self, obj):
        return obj.date_joined.strftime('%B %Y') if obj.date_joined else None


class OnlinePlayerSerializer(SparseFieldsMixin, serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    best_score = serializers.IntegerField(source='user.best_score', read_only=True)
    total_games_played = serializers.IntegerField(source='user.total_games_played', read_only=True)
    current_game = serializers.SerializerMethodField()

    class Meta:
        model = OnlinePlayer
        fields = ['id', 'username', 'best_score', 'total_games_played', 'last_ping', 'current_game']

    def get_current_game(self, obj):
        if obj.current_game and obj.current_game.is_active:
            return {
                'id': obj.current_game.id,
                'score': obj.current_game.score
            }
        return None


class GameSessionSerializer(SparseFieldsMixin, serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GameSession
        fields = ['id', 'username', 'score', 'game_data', 'created_at', 'updated_at', 'is_active']


class HighScoreSerializer(SparseFieldsMixin, serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = HighScore
        fields = ['id', 'user_id', 'username', 'score', 'date_achieved', 'profile_photo_url']
    
    def get_profile_photo_url(self, obj):
        if obj.user.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_photo.url)
            return obj.user.profile_photo.url
        return None


class GameStateSerializer(serializers.Serializer):
    snake = serializers.ListField(
        child=serializers.ListField(
            child=serializers.IntegerField(min_value=0, max_value=19),
            min_length=2,
            max_length=2
        ),
        min_length=1
    )
    food = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=19),
        min_length=2,
        max_length=2
    )
    direction = serializers.ChoiceField(choices=['up', 'down', 'left', 'right'])
    score = serializers.IntegerField(min_value=0)
    game_over = serializers.BooleanField()

    def validate_snake(self, value):
        """Validate that snake segments are valid"""
        if not value:
            raise serializers.ValidationError("Snake must have at least one segment")
        
        # Check for duplicate segments (self-collision)
        segments_set = set(tuple(segment) for segment in value)
        if len(segments_set) != len(value):
            # This might be valid if the game just ended due to collision
            pass
            
        return value


class UpdateGameSerializer(serializers.Serializer):
    game_data = GameStateSerializer()
    score = serializers.IntegerField()
