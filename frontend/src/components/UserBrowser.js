import React, { useState, useEffect } from 'react';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const UserBrowser = ({ onClose, onViewProfile, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE}/api/users/?fields=id,username,best_score,total_games_played,profile_photo_url,is_online,location`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="user-browser-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <button onClick={onClose} className="close-button">✕</button>
          <h2>Browse Players</h2>
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search players by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="users-content">
          {loading ? (
            <div className="loading">Loading players...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="user-card"
                  onClick={() => onViewProfile(user.id)}
                >
                  <div className="user-avatar">
                    {user.profile_photo_url ? (
                      <img src={user.profile_photo_url} alt="Profile" />
                    ) : (
                      <span className="avatar-initials">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="user-info">
                    <h4 className="username">
                      {user.username}
                      {user.id === currentUser?.id && (
                        <span className="you-badge">You</span>
                      )}
                    </h4>
                    
                    <div className="user-stats">
                      <span className="stat">
                        🏆 {user.best_score || 0}
                      </span>
                      <span className="stat">
                        🎮 {user.total_games_played || 0}
                      </span>
                    </div>

                    <div className="user-status">
                      <span className={`status-dot ${user.is_online ? 'online' : 'offline'}`}></span>
                      <span className="status-text">
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    {user.location && (
                      <div className="user-location">
                        📍 {user.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="no-users">
              <div className="no-users-icon">🔍</div>
              <div className="no-users-text">
                {searchTerm ? 'No players found matching your search' : 'No players found'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBrowser;
