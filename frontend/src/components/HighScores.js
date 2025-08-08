import React, { useState } from 'react';
import ProfileModal from './ProfileModal';

const HighScores = ({ scores, currentUser }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleViewProfile = (userId) => {
    if (userId) {
      setSelectedUserId(userId);
      setShowProfileModal(true);
    }
  };

  if (!scores || scores.length === 0) {
    return (
      <div className="high-scores">
        <h3>🏆 High Scores</h3>
        <p>No scores yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="high-scores">
      <h3>🏆 High Scores</h3>
      <ol>
        {scores.map((score, index) => (
          <li key={score.id || index} className="high-score-item">
            <div className="rank-number">#{index + 1}</div>
            <div 
              className="player-info"
              onClick={() => handleViewProfile(score.user_id)}
              style={{ cursor: score.user_id ? 'pointer' : 'default' }}
            >
              <div className="player-avatar-small">
                {score.profile_photo_url ? (
                  <img src={score.profile_photo_url} alt="Profile" />
                ) : (
                  <span className="avatar-initials">
                    {(score.username || score.player_name)?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <span className="player-name">{score.username || score.player_name}</span>
            </div>
            <span className="score-value">{score.score}</span>
          </li>
        ))}
      </ol>
      
      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userId={selectedUserId}
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onEditProfile={() => {}} // HighScores doesn't need edit functionality
        />
      )}
    </div>
  );
};

export default HighScores;
