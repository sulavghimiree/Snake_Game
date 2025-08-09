import React, { useState, useRef } from 'react';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const EditProfile = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    bio: user.bio || '',
    location: user.location || '',
    favorite_score: user.favorite_score || '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user.profile_photo_url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');

      // Update profile data
  const profileResponse = await fetch(`${API_BASE}/api/auth/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }

      let updatedUser = await profileResponse.json();

      // Upload photo if selected
      if (profilePhoto) {
        const photoFormData = new FormData();
        photoFormData.append('profile_photo', profilePhoto);

  const photoResponse = await fetch(`${API_BASE}/api/profile/photo/upload/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: photoFormData,
        });

        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          updatedUser.profile_photo_url = photoData.profile_photo;
        }
      }

      onSave(updatedUser);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <button onClick={onClose} className="close-button">✕</button>
          <h2>Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="photo-section">
            <div className="photo-upload">
              <div className="current-photo" onClick={() => fileInputRef.current.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" />
                ) : (
                  <div className="photo-placeholder">
                    <span className="upload-icon">📷</span>
                    <span>Click to upload photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="change-photo-btn"
              >
                Change Photo
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="bio">About Me</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell others about yourself..."
                maxLength={500}
                rows={4}
              />
              <span className="char-count">{formData.bio.length}/500</span>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your city or country"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="favorite_score">Favorite Score</label>
              <input
                type="number"
                id="favorite_score"
                name="favorite_score"
                value={formData.favorite_score}
                onChange={handleInputChange}
                placeholder="Your most memorable score"
                min={0}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
