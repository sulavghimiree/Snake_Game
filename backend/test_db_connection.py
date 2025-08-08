#!/usr/bin/env python
"""
Database Connection Test Script
Tests the connection to your configured database (SQLite or PostgreSQL)
"""

import os
import sys
import django
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'snake_backend.settings')
django.setup()

from django.db import connection
from django.conf import settings

def test_database_connection():
    """
    Test database connection and display information
    """
    try:
        print("🔧 Testing database connection...")
        print("=" * 50)
        
        # Get database configuration
        db_config = settings.DATABASES['default']
        print(f"📊 Database Engine: {db_config['ENGINE']}")
        
        if 'postgresql' in db_config['ENGINE']:
            print(f"🐘 PostgreSQL Database")
            print(f"   Host: {db_config.get('HOST', 'localhost')}")
            print(f"   Port: {db_config.get('PORT', '5432')}")
            print(f"   Database: {db_config.get('NAME', 'postgres')}")
            print(f"   User: {db_config.get('USER', 'postgres')}")
        else:
            print(f"💾 SQLite Database")
            print(f"   Path: {db_config.get('NAME', 'db.sqlite3')}")
        
        # Test the connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        if result:
            print("\n✅ Database connection successful!")
            
            # Check if tables exist
            with connection.cursor() as cursor:
                if 'postgresql' in db_config['ENGINE']:
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' AND table_name LIKE 'game_%'
                    """)
                else:
                    cursor.execute("""
                        SELECT name 
                        FROM sqlite_master 
                        WHERE type='table' AND name LIKE 'game_%'
                    """)
                
                tables = cursor.fetchall()
                
                if tables:
                    print(f"📋 Found {len(tables)} game-related tables:")
                    for table in tables:
                        print(f"   - {table[0]}")
                        
                    # Check user count
                    try:
                        cursor.execute("SELECT COUNT(*) FROM auth_user")
                        user_count = cursor.fetchone()[0]
                        print(f"👥 Total users: {user_count}")
                    except Exception as e:
                        print(f"⚠️ Could not count users: {e}")
                        
                    # Check high scores count
                    try:
                        cursor.execute("SELECT COUNT(*) FROM game_highscore")
                        score_count = cursor.fetchone()[0]
                        print(f"🏆 Total high scores: {score_count}")
                    except Exception as e:
                        print(f"⚠️ Could not count high scores: {e}")
                        
                else:
                    print("⚠️ No game tables found. You may need to run migrations:")
                    print("   python manage.py makemigrations")
                    print("   python manage.py migrate")
        
    except Exception as e:
        print(f"\n❌ Database connection failed!")
        print(f"Error: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your DATABASE_URL in .env file")
        print("2. Ensure your database server is running")
        print("3. Verify connection credentials")
        print("4. Check network connectivity to database host")
        return False
    
    return True

if __name__ == "__main__":
    print("🐍 Snake Game Database Connection Test")
    print("=" * 40)
    test_database_connection()
