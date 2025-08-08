from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import GameSession, HighScore


class GameSessionModelTest(TestCase):
    def test_create_game_session(self):
        game = GameSession.objects.create(
            player_name="TestPlayer",
            score=100,
            game_data={'snake': [[1, 1]], 'food': [5, 5]}
        )
        self.assertEqual(game.player_name, "TestPlayer")
        self.assertEqual(game.score, 100)
        self.assertTrue(game.is_active)


class GameAPITest(APITestCase):
    def test_start_game(self):
        url = '/api/games/start_game/'
        data = {'player_name': 'TestPlayer'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('game_id', response.data)
        self.assertIn('game_state', response.data)

    def test_get_high_scores(self):
        # Create some high scores
        HighScore.objects.create(player_name="Player1", score=100)
        HighScore.objects.create(player_name="Player2", score=200)
        
        url = '/api/games/high_scores/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
