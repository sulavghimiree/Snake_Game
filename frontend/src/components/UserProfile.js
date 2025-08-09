import React, { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import EditProfile from './EditProfile';
import UserBrowser from './UserBrowser';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const UserProfile = ({ user, authToken, onLogout }) => {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showUserBrowser, setShowUserBrowser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchProfile = async () => {
    if (!authToken) return;

    setLoading(true);
    try {
  const response = await fetch(`${API_BASE}/api/auth/profile/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setError('');
      } else if (response.status === 401) {
        setError('Authentication failed');
        onLogout();
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
  await fetch(`${API_BASE}/api/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      // Clear local storage and call logout regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      onLogout();
    }
  };

  useEffect(() => {
    if (authToken && (!profile || !profile.date_joined)) {
      fetchProfile();
    }
  }, [authToken]);

  const handleViewOwnProfile = () => {
    setSelectedUserId(null); // null means own profile
    setShowProfileModal(true);
  };

  const handleViewUserProfile = (userId) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  const handleEditProfile = (userToEdit) => {
    setShowProfileModal(false);
    setShowEditProfile(true);
  };

  const handleProfileSaved = (updatedUser) => {
    setProfile(updatedUser);
    setShowEditProfile(false);
  };

  const handleBrowseUsers = () => {
    setShowUserBrowser(true);
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="user-profile">
        <div className="error-message">{error}</div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-title">
          <div 
            className="profile-avatar" 
            onClick={handleViewOwnProfile}
            title="View your profile"
          >
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="Profile" />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <h3 
              onClick={handleViewOwnProfile}
              title="View your profile"
              style={{ cursor: 'pointer' }}
            >
              Welcome, {profile?.username}!
            </h3>
            {profile?.is_online && (
              <div className="status-indicator">
                <span className="status-dot online"></span>
                <span className="status-text">Online</span>
              </div>
            )}
          </div>
        </div>
        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-button">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
      
      {profile && (
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">
              <span className="stat-icon">🏆</span>
              Best Score
            </span>
            <span className="stat-value">{profile.best_score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">
              <span className="stat-icon">🎮</span>
              Games Played
            </span>
            <span className="stat-value">{profile.total_games_played}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">
              <span className="stat-icon">📅</span>
              Member Since
            </span>
            <span className="stat-value">
              {(() => {
                if (!profile.date_joined) {
                  console.log('UserProfile: No date_joined field in profile:', profile);
                  return 'Unknown';
                }
                
                const date = new Date(profile.date_joined);
                
                // Check if date is valid
                if (isNaN(date.getTime())) {
                  console.log('UserProfile: Invalid date_joined value:', profile.date_joined);
                  // Try parsing ISO format manually if needed
                  const isoMatch = profile.date_joined.match(/^(\d{4})-(\d{2})-(\d{2})/);
                  if (isoMatch) {
                    const [, year, month, day] = isoMatch;
                    const parsedDate = new Date(year, month - 1, day);
                    if (!isNaN(parsedDate.getTime())) {
                      return parsedDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    }
                  }
                  return 'Unknown';
                }
                
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              })()}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userId={selectedUserId}
          currentUser={profile}
          onClose={() => setShowProfileModal(false)}
          onEditProfile={handleEditProfile}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          user={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={handleProfileSaved}
        />
      )}

      {/* User Browser Modal */}
      {showUserBrowser && (
        <UserBrowser
          currentUser={profile}
          onClose={() => setShowUserBrowser(false)}
          onViewProfile={handleViewUserProfile}
        />
      )}
    </div>
  );
};

export default UserProfile;
