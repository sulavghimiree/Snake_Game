import React, { useState, useEffect } from 'react';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const ProfileModal = ({ userId, currentUser, onClose, onEditProfile }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const url = userId 
        ? `${API_BASE}/api/profile/${userId}/`
        : `${API_BASE}/api/auth/profile/`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-overlay">
        <div className="profile-modal">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-overlay">
        <div className="profile-modal">
          <div className="error">{error}</div>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <button onClick={onClose} className="close-button">✕</button>
          <h2>User Profile</h2>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Profile" />
              ) : (
                <span className="avatar-initials">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="profile-username">{user.username}</h3>
            {isOwnProfile && (
              <button 
                onClick={() => onEditProfile(user)} 
                className="edit-profile-button"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="profile-info">
            <div className="info-section">
              <h4>Game Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">🏆 Best Score</span>
                  <span className="stat-value">{user.best_score || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🎮 Games Played</span>
                  <span className="stat-value">{user.total_games_played || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">📅 Joined</span>
                  <span className="stat-value">{user.join_date_formatted || 'Unknown'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">🌟 Status</span>
                  <span className={`stat-value ${user.is_online ? 'online' : 'offline'}`}>
                    {user.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {user.bio && (
              <div className="info-section">
                <h4>About</h4>
                <p className="bio-text">{user.bio}</p>
              </div>
            )}

            {user.location && (
              <div className="info-section">
                <h4>Location</h4>
                <p className="location-text">📍 {user.location}</p>
              </div>
            )}

            {user.favorite_score && (
              <div className="info-section">
                <h4>Favorite Score</h4>
                <p className="favorite-score">🎯 {user.favorite_score}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
