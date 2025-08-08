# Generated manually to add google_id field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_alter_highscore_unique_together_user_google_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='google_id_temp',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
