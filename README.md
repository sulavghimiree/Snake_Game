# Snake Game - Django + React

A classic Snake game built with Django REST API backend and React frontend.

## Features

- Classic Snake gameplay with modern UI
- **Google OAuth Authentication** - Sign in/up with Google account
- **User Profiles** with profile pictures and customization
- **Profile Browser** - View other players' profiles (desktop only)
- **Mobile-friendly controls** with touch support and swipe gestures
- Real-time score tracking
- High scores leaderboard with profile pictures
- **Responsive design** that adapts to all screen sizes
- **Progressive Web App (PWA)** support for mobile installation
- Pause/Resume functionality
- Player name input
- Smooth animations and visual effects
- **Touch controls** for mobile devices
- **Haptic feedback** on supported devices

## Tech Stack

### Backend

- Django 4.2.7
- Django REST Framework
- SQLite database
- CORS headers for frontend integration

### Frontend

- React 18
- Axios for API calls
- CSS3 animations
- **Mobile-responsive design**
- **Touch controls and swipe gestures**
- **PWA (Progressive Web App) capabilities**
- **Optimized for mobile gameplay**

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Create and activate a virtual environment:

   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   ```
   cp .env.example .env
   ```

   Edit `.env` and add your Google OAuth credentials (see Google OAuth Setup below).

5. Run migrations:

   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser (optional):

   ```
   python manage.py createsuperuser
   ```

7. Start the Django development server:
   ```
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Google OAuth Setup

To enable Google sign-in/sign-up functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity Services API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add authorized JavaScript origins: `http://localhost:3000`
7. Add authorized redirect URIs: `http://localhost:3000`
8. Copy your Client ID and Client Secret
9. Update the `.env` files in both backend and frontend directories with your credentials

Detailed setup instructions are available in `GOOGLE_OAUTH_SETUP.md`.

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:

   ```
   cp .env.example .env
   ```

   Edit `.env` and add your Google OAuth Client ID.

4. Start the React development server:
   ```
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## Game Controls

### Desktop

- **Arrow Keys** or **WASD**: Control snake direction
- **Space**: Pause/Resume game (when implemented)
- **Enter**: Start new game

### Mobile

- **Swipe Gestures**: Swipe on the game board in any direction to control the snake
- **Touch Controls**: Use the directional buttons that appear during gameplay
- **Tap**: Tap game controls for pause/resume and restart

### Mobile Features

- **Responsive Layout**: Game automatically adapts to screen size
- **Touch-Optimized**: Large touch targets for easy control
- **Haptic Feedback**: Vibration feedback on supported devices
- **PWA Support**: Install as an app on mobile devices
- **Optimized Performance**: Smooth gameplay on mobile devices

## API Endpoints

- `POST /api/games/start_game/` - Start a new game
- `POST /api/games/{id}/update_game/` - Update game state
- `POST /api/games/{id}/end_game/` - End a game
- `GET /api/games/high_scores/` - Get high scores
- `GET /api/games/generate_food/` - Generate random food position

## Game Rules

1. Use arrow keys or WASD to control the snake
2. Eat red food to grow and increase score (+10 points)
3. Avoid hitting walls or yourself
4. Try to achieve the highest score!

## Development

### Running Tests

Backend:

```
cd backend
python manage.py test
```

Frontend:

```
cd frontend
npm test
```

### Building for Production

Frontend:

```
cd frontend
npm run build
```

## Project Structure

```
Snake_Game/
├── backend/
│   ├── snake_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── game/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameBoard.js
│   │   │   ├── GameControls.js
│   │   │   ├── HighScores.js
│   │   │   ├── PlayerInput.js
│   │   │   ├── MobileControls.js
│   │   │   └── MobileDebug.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── mobileUtils.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Mobile Installation (PWA)

The Snake Game can be installed as a Progressive Web App on mobile devices:

### iOS (Safari)

1. Open the game in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add" to install

### Android (Chrome)

1. Open the game in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Tap "Add" to install

## Troubleshooting

### Mobile Issues

- **Touch not working**: Ensure you're tapping directly on the game board or control buttons
- **Game too small**: The game automatically scales, but you can try rotating your device
- **Performance issues**: Close other apps and ensure good network connection
- **Controls not responsive**: Try refreshing the page or clearing browser cache

### Desktop Issues

- **CORS errors**: Make sure both frontend (port 3000) and backend (port 8000) are running
- **API not responding**: Check that Django server is running on localhost:8000

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Future Enhancements

- Multiplayer support
- Different difficulty levels
- Power-ups and special foods
- Custom themes
- Mobile touch controls
- Sound effects
- Game statistics and analytics
