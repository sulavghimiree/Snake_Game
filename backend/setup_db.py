#!/usr/bin/env python
"""
Setup script for Snake Game backend
Run this after installing dependencies to set up the database
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_database():
    """Set up the database with initial migrations and data"""
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'snake_backend.settings')
    django.setup()
    
    print("Setting up Snake Game database...")
    
    # Run migrations
    print("Creating database tables...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create sample high scores
    print("Creating sample high scores...")
    try:
        execute_from_command_line(['manage.py', 'create_sample_scores'])
    except Exception as e:
        print(f"Note: Could not create sample scores - {e}")
    
    print("Database setup complete!")
    print("\nNext steps:")
    print("1. Start the Django server: python manage.py runserver")
    print("2. Visit http://localhost:8000/admin to access admin panel")
    print("3. Start the React frontend on port 3000")

if __name__ == '__main__':
    setup_database()
