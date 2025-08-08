from django.core.management.base import BaseCommand
from game.models import HighScore, User


class Command(BaseCommand):
    help = 'Create sample high scores for testing'

    def handle(self, *args, **options):
        # Clear existing high scores
        HighScore.objects.all().delete()
        
        # Create sample users and high scores
        sample_scores = [
            ('SnakeMaster', 450),
            ('PythonPro', 380),
            ('GameHero', 320),
            ('SpeedDemon', 290),
            ('PixelHunter', 250),
            ('RetroGamer', 220),
            ('CodeNinja', 180),
            ('ArcadeKing', 150),
            ('SnakeRookie', 120),
            ('FirstTimer', 100),
        ]
        
        for username, score in sample_scores:
            # Create or get user
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username.lower()}@example.com'}
            )
            
            # Create high score
            HighScore.objects.create(user=user, score=score)
            
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(sample_scores)} sample high scores'
            )
        )
