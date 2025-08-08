import React, { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import HighScores from './components/HighScores';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import UserProfile from './components/UserProfile';
import UserBrowser from './components/UserBrowser';
import OnlinePlayers from './components/OnlinePlayers';
import MobileControls from './components/MobileControls';
import { gameAPI } from './services/api';
import { setupMobileOptimizations } from './utils/mobileUtils';
import './App.css';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Game state
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameStatus, setGameStatus] = useState('menu'); // menu, playing, paused, gameOver
  const [highScores, setHighScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const directionChangeRef = useRef(null);

  // Modal states
  const [showUserBrowser, setShowUserBrowser] = useState(false);

  useEffect(() => {
    // Check for stored authentication
    const storedToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    
    if (storedToken && storedUsername) {
      setAuthToken(storedToken);
      setUser({ username: storedUsername });
    }
    
    loadHighScores();
    
    // Setup mobile optimizations
    const cleanup = setupMobileOptimizations();
    
    return cleanup;
  }, []);

  const loadHighScores = async () => {
    try {
      const scores = await gameAPI.getHighScores(authToken);
      setHighScores(scores);
    } catch (error) {
      console.error('Failed to load high scores:', error);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setError('');
    loadHighScores();
  };

  const handleSignup = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setError('');
    loadHighScores();
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    setGameState(null);
    setGameId(null);
    setGameStatus('menu');
    setError('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    loadHighScores();
  };

  const startGame = async () => {
    if (!authToken) {
      setError('Please log in to play');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await gameAPI.startGame(authToken);
      setGameId(response.game_id);
      setGameState(response.game_state);
      setGameStatus('playing');
    } catch (error) {
      setError('Failed to start game. Please try again.');
      console.error('Start game error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGame = async (newGameState) => {
    if (!gameId || !authToken) return;

    try {
      await gameAPI.updateGame(gameId, {
        game_data: newGameState,
        score: newGameState.score
      }, authToken);
      
      if (newGameState.game_over) {
        // End the game session and save high score
        try {
          await gameAPI.endGame(gameId, authToken);
        } catch (error) {
          console.error('End game error:', error);
        }
        
        setGameStatus('gameOver');
        loadHighScores(); // Refresh high scores
      }
    } catch (error) {
      console.error('Update game error:', error);
    }
  };

  const restartGame = async () => {
    // Reset current game state
    setGameState(null);
    setGameId(null);
    setError('');
    
    // Automatically start a new game instead of going to menu
    if (!authToken) {
      setError('Please log in to play');
      return;
    }

    setLoading(true);
    
    try {
      const response = await gameAPI.startGame(authToken);
      setGameId(response.game_id);
      setGameState(response.game_state);
      setGameStatus('playing');
    } catch (error) {
      setError('Failed to start new game. Please try again.');
      console.error('Restart game error:', error);
      setGameStatus('menu'); // Fallback to menu if new game fails
    } finally {
      setLoading(false);
    }
  };

  const pauseGame = () => {
    setGameStatus(gameStatus === 'paused' ? 'playing' : 'paused');
  };

  const handleMobileDirectionChange = (direction) => {
    if (directionChangeRef.current) {
      directionChangeRef.current(direction);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyPress = (event) => {
      // Only handle shortcuts when user is authenticated and game is active
      if (!user || !authToken) return;
      
      const key = event.key.toLowerCase();
      
      // Space bar for pause/unpause
      if (key === ' ' || key === 'spacebar') {
        event.preventDefault();
        if (gameStatus === 'playing' || gameStatus === 'paused') {
          pauseGame();
        }
        return;
      }
      
      // 'N' key for new game
      if (key === 'n') {
        event.preventDefault();
        if (gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'gameOver') {
          restartGame();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [user, authToken, gameStatus, pauseGame, restartGame]);

  // If not authenticated, show login/signup forms
  if (!user || !authToken) {
    return (
      <div className="App">
        <div className="auth-wrapper">
          {authMode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => setAuthMode('signup')}
            />
          ) : (
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="game-container">
        {/* Main Game Area */}
        <div className="game-main">
          {/* Browse Button - Desktop Only */}
          <button 
            className="browse-btn desktop-only" 
            onClick={() => setShowUserBrowser(true)}
            title="Browse Players"
          >
            👥 Browse
          </button>
          
          <div className="game-header">
            <div className="game-title">
              <h1>🐍 Snake Game</h1>
              <div className="game-subtitle">Classic arcade fun, modern style</div>
            </div>
            {gameState && (
              <div className="score-display">
                <div className="score-label">Score</div>
                <div className="score-value">{gameState.score}</div>
              </div>
            )}
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {loading && (
            <div className="loading-banner">
              <div className="loading-spinner"></div>
              <span>Starting game...</span>
            </div>
          )}

          {gameStatus === 'menu' && (
            <div className="menu-container">
              <div className="welcome-message">
                <h2>Ready to Play?</h2>
                <p>Test your skills and climb the leaderboard!</p>
              </div>
              <button 
                onClick={startGame} 
                className="start-button game-button-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Starting...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🎮</span>
                    Start Game
                  </>
                )}
              </button>
            </div>
          )}

          {(gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'gameOver') && (
            <>
              <GameBoard
                gameState={gameState}
                setGameState={setGameState}
                gameStatus={gameStatus}
                onUpdateGame={updateGame}
                playerName={user.username}
                onDirectionChange={directionChangeRef}
              />
              <GameControls
                gameStatus={gameStatus}
                onRestart={restartGame}
                onPause={pauseGame}
              />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="game-sidebar">
          <UserProfile
            user={user}
            authToken={authToken}
            onLogout={handleLogout}
          />

          <OnlinePlayers authToken={authToken} currentUser={user} />

          {gameStatus === 'menu' && (
            <div className="instructions">
              <h4>
                <span className="instructions-icon">🎯</span>
                How to Play:
              </h4>
              <div className="instruction-list">
                <div className="instruction-item">
                  <span className="instruction-icon">🖥️</span>
                  <span>Desktop: Use arrow keys or WASD to control the snake</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⌨️</span>
                  <span>PC Shortcuts: Space to pause/unpause, N for new game</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">📱</span>
                  <span>Mobile: Swipe on the game board or use touch controls</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🍎</span>
                  <span>Eat the red food to grow and increase your score</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">⚠️</span>
                  <span>Don't hit the walls or yourself!</span>
                </div>
              </div>
            </div>
          )}

          <HighScores scores={highScores} currentUser={user} />
        </div>

        {/* Mobile Touch Controls */}
        <MobileControls 
          gameStatus={gameStatus}
          onDirectionChange={handleMobileDirectionChange}
        />
      </div>

      {/* User Browser Modal */}
      {showUserBrowser && (
        <UserBrowser 
          onClose={() => setShowUserBrowser(false)}
          currentUser={user}
          authToken={authToken}
        />
      )}
    </div>
  );
}

export default App;
