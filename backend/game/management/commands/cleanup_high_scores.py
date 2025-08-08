from django.core.management.base import BaseCommand
from game.models import HighScore
from django.db.models import Max


class Command(BaseCommand):
    help = 'Clean up high scores to keep only the best score for each user'

    def handle(self, *args, **options):
        # Get all users who have high scores
        users_with_scores = HighScore.objects.values('user').distinct()
        
        deleted_count = 0
        for user_data in users_with_scores:
            user_id = user_data['user']
            user_scores = HighScore.objects.filter(user_id=user_id)
            
            if user_scores.count() > 1:
                # Find the best score for this user
                best_score = user_scores.aggregate(Max('score'))['score__max']
                
                # Keep the first occurrence of the best score and delete the rest
                best_score_obj = user_scores.filter(score=best_score).first()
                
                # Delete all other scores for this user
                other_scores = user_scores.exclude(id=best_score_obj.id)
                count = other_scores.count()
                other_scores.delete()
                
                deleted_count += count
                
                self.stdout.write(
                    f'User {best_score_obj.user.username}: kept best score {best_score}, deleted {count} other scores'
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Cleanup completed. Deleted {deleted_count} duplicate high scores.'
            )
        )
