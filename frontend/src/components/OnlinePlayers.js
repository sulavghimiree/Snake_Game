import React, { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';

const OnlinePlayers = ({ authToken, currentUser }) => {
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchOnlinePlayers = async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/online-players/', {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOnlinePlayers(data);
        setError('');
      } else if (response.status === 401) {
        setError('Authentication failed');
      } else {
        setError('Failed to fetch online players');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const sendPing = async () => {
    if (!authToken) return;

    try {
      await fetch('http://localhost:8000/api/ping/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.warn('Ping failed:', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchOnlinePlayers();
      
      // Send initial ping
      sendPing();
      
      // Set up intervals
      const pingInterval = setInterval(sendPing, 30000); // Ping every 30 seconds
      const fetchInterval = setInterval(fetchOnlinePlayers, 15000); // Fetch online players every 15 seconds

      return () => {
        clearInterval(pingInterval);
        clearInterval(fetchInterval);
      };
    }
  }, [authToken]);

  const handleViewProfile = (userId) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  if (!authToken) {
    return null;
  }

  if (loading) {
    return (
      <div className="online-players">
        <h3>Online Players</h3>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="online-players">
        <h3>Online Players</h3>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="online-players">
      <div className="section-header">
        <h3>
          <span className="section-icon">👥</span>
          Online Players ({onlinePlayers.length})
        </h3>
        <div className="refresh-indicator">
          <span className="pulse-dot"></span>
          <span className="refresh-text">Live</span>
        </div>
      </div>
      
      {onlinePlayers.length === 0 ? (
        <div className="no-players">
          <div className="no-players-icon">😴</div>
          <div className="no-players-text">No players online</div>
          <div className="no-players-subtext">Be the first to start playing!</div>
        </div>
      ) : (
        <div className="players-list">
          {onlinePlayers.map((player) => (
            <div key={player.id} className="player-item">
              <div 
                className="player-avatar"
                onClick={() => handleViewProfile(player.id)}
                style={{ cursor: 'pointer' }}
                title={`View ${player.username}'s profile`}
              >
                <span className="avatar-icon">👤</span>
                {player.current_game && (
                  <span className="playing-badge">🎮</span>
                )}
              </div>
              
              <div className="player-details">
                <div 
                  className="player-name"
                  onClick={() => handleViewProfile(player.id)}
                  style={{ cursor: 'pointer' }}
                  title={`View ${player.username}'s profile`}
                >
                  {player.username}
                </div>
                <div className="player-stats">
                  <span className="stat">🏆 {player.best_score}</span>
                  <span className="stat-separator">•</span>
                  <span className="stat">🎯 {player.total_games_played}</span>
                </div>
                
                {player.current_game ? (
                  <div className="current-game">
                    <span className="game-status playing">Playing</span>
                    <span className="current-score">Score: {player.current_game.score}</span>
                  </div>
                ) : (
                  <div className="player-online-status">
                    <span className="status-dot online"></span>
                    <span className="status-text">Online</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userId={selectedUserId}
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onEditProfile={() => {}} // OnlinePlayers doesn't need edit functionality
        />
      )}
    </div>
  );
};

export default OnlinePlayers;
