import React, { useEffect, useRef, useCallback } from 'react';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const GoogleAuthButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
  const buttonRef = useRef(null);

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      // Send the Google credential to our backend
  const backendResponse = await fetch(`${API_BASE}/api/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        // Store the token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        onSuccess(data.user, data.token);
      } else {
        onError(data.error || 'Google authentication failed');
      }
    } catch (error) {
      onError('Network error during Google authentication');
      console.error('Google Auth Error:', error);
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      console.log('Initializing Google Sign-In...');
      console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
      
      if (window.google && buttonRef.current) {
        try {
          const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '480472921136-0rmp6b98eaaus0hhs9b6ebojjp4e09q4.apps.googleusercontent.com';
          
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
          
          console.log('Google Sign-In button rendered successfully');
        } catch (error) {
          console.error('Failed to initialize Google Sign-In:', error);
          onError('Failed to initialize Google Sign-In');
        }
      } else {
        console.error('Google library not loaded or button ref not available');
        if (!window.google) {
          console.error('window.google not found');
        }
        if (!buttonRef.current) {
          console.error('buttonRef.current not found');
        }
      }
    };

    // Check if Google script is loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      console.log('Waiting for Google script to load...');
      // Wait for Google script to load
      const script = document.querySelector('script[src*="gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogleSignIn);
        return () => script.removeEventListener('load', initializeGoogleSignIn);
      } else {
        console.error('Google GSI script not found in document');
      }
    }
  }, [handleCredentialResponse, onError]);

  return (
    <div className="google-auth-container">
      <div className="divider">
        <span className="divider-text">or</span>
      </div>
      <div ref={buttonRef} className="google-auth-button"></div>
    </div>
  );
};

export default GoogleAuthButton;
