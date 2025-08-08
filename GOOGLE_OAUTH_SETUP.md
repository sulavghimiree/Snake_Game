# Google OAuth Setup Guide

## 🚀 Complete Google Login/Signup Integration

Your Snake Game now supports Google OAuth authentication! Users can sign in or sign up using their Google accounts.

## ✅ What's Been Implemented

### Backend (Django):

- ✅ Google OAuth authentication endpoint at `/api/auth/google/`
- ✅ Google token verification using `google-auth` library
- ✅ Automatic user creation/lookup by email
- ✅ Django authentication token generation
- ✅ Environment configuration support

### Frontend (React):

- ✅ Google Identity Services integration
- ✅ GoogleAuthButton component
- ✅ Google login/signup buttons in auth forms
- ✅ Modern responsive UI with Google branding
- ✅ Environment configuration support

## 🔧 Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable required APIs:
   - Google+ API
   - Google Identity Services API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Configure authorized origins and redirects:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000`
7. Copy your **Client ID** and **Client Secret**

### 2. Backend Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Add your Google credentials:
   ```bash
   GOOGLE_OAUTH2_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_OAUTH2_CLIENT_SECRET=your-client-secret
   ```

### 3. Frontend Configuration

1. Copy `frontend/.env.example` to `frontend/.env`
2. Add your Google Client ID:
   ```bash
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

## 🔄 How It Works

1. **User clicks "Continue with Google"** → Google OAuth popup appears
2. **User authorizes the app** → Google returns a JWT credential
3. **Frontend sends credential to backend** → `/api/auth/google/` endpoint
4. **Backend verifies token** → Uses Google's verification service
5. **User lookup/creation** → Finds existing user by email or creates new one
6. **Django token generation** → Returns authentication token
7. **Frontend receives token** → Stores token and logs user in

## 🎨 UI Features

- **Modern Google branding** with official Google sign-in button
- **Responsive design** that works on all devices
- **Smooth animations** and hover effects
- **Error handling** with user-friendly messages
- **Seamless integration** with existing auth forms

## 🔐 Security Features

- **Server-side token verification** using Google's official library
- **Email-based user matching** (no Google ID stored in database)
- **Django token authentication** for secure API access
- **Environment-based configuration** for secure credential storage

## 📱 User Experience

Users can now:

- **Sign up instantly** with their Google account (no form filling!)
- **Log in quickly** without remembering passwords
- **Use existing profiles** if they sign up with email first
- **Enjoy seamless authentication** across devices

## 🧪 Testing

1. Start the Django backend: `python manage.py runserver`
2. Start the React frontend: `npm start`
3. Navigate to login/signup forms
4. Look for the "Continue with Google" button
5. Test the OAuth flow!

## 🎯 Next Steps

Your Google OAuth integration is now complete! The system will:

- Automatically create user profiles for new Google sign-ins
- Link Google accounts to existing email-based accounts
- Provide smooth authentication for returning users

**Enjoy your enhanced Snake Game with Google OAuth! 🐍✨**
