# Snake Game Backend Setup Guide (Windows)

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Setup Instructions

### 1. Create and Activate Virtual Environment

Open PowerShell and navigate to the backend directory:

```powershell
cd "c:\My_Files\My_Learnings\Test\Snake_Game\backend"
```

Create virtual environment:

```powershell
python -m venv venv
```

Activate virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

**Note:** If you get an execution policy error, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Install Dependencies

Install required packages:

```powershell
pip install -r requirements.txt
```

### 3. Set up Database

Create and apply migrations:

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Optional)

Create an admin user:

```powershell
python manage.py createsuperuser
```

### 5. Create Sample Data (Optional)

Add sample high scores:

```powershell
python manage.py create_sample_scores
```

### 6. Start Development Server

Start the Django server:

```powershell
python manage.py runserver
```

The backend will be available at: http://localhost:8000

### 7. Test API Endpoints

You can test the API at:

- http://localhost:8000/admin (Django admin)
- http://localhost:8000/api/games/ (Game API)
- http://localhost:8000/api/games/high_scores/ (High scores)

## Troubleshooting

### Common Issues:

1. **Import Errors**: Make sure virtual environment is activated and dependencies are installed
2. **Port Already in Use**: Use `python manage.py runserver 8001` to run on different port
3. **CORS Errors**: Make sure django-cors-headers is installed and configured
4. **Database Errors**: Run migrations with `python manage.py migrate`

### Useful Commands:

```powershell
# Check Django installation
python -c "import django; print(django.get_version())"

# Check for issues
python manage.py check

# View all URLs
python manage.py show_urls

# Reset database (caution: deletes all data)
Remove-Item db.sqlite3
python manage.py migrate

# View logs in real-time
python manage.py runserver --verbosity=2
```

## Development Settings

For development with more verbose logging, use:

```powershell
python manage.py runserver --settings=snake_backend.dev_settings
```

## API Documentation

### Start Game

```http
POST /api/games/start_game/
Content-Type: application/json

{
    "player_name": "YourName"
}
```

### Update Game

```http
POST /api/games/{game_id}/update_game/
Content-Type: application/json

{
    "game_data": {
        "snake": [[1,1], [1,2]],
        "food": [5,5],
        "direction": "up",
        "score": 10,
        "game_over": false
    },
    "score": 10
}
```

### Get High Scores

```http
GET /api/games/high_scores/
```

The backend is now ready to work with the React frontend!
