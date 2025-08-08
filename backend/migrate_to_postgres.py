#!/usr/bin/env python
"""
Data Migration Script: SQLite to PostgreSQL (Supabase)
This script helps you migrate existing data from SQLite to PostgreSQL.
"""

import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

def migrate_data():
    """
    Migrate data from SQLite to PostgreSQL
    """
    print("🚀 Starting data migration from SQLite to PostgreSQL...")
    
    # Step 1: Create data dump from SQLite
    print("\n📦 Step 1: Creating data dump from current SQLite database...")
    os.system("python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 > data_dump.json")
    print("✅ Data dump created: data_dump.json")
    
    # Step 2: Instructions for PostgreSQL setup
    print("\n🔧 Step 2: Update your .env file with Supabase PostgreSQL connection string")
    print("   Example: DATABASE_URL=postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres")
    print("   Make sure to replace 'your_password' and 'xxx' with your actual values")
    print("   Remove the 'sqlite' DATABASE_URL line and uncomment the PostgreSQL line")
    input("   Press Enter when you've updated your .env file...")
    
    # Step 3: Create new migrations and migrate
    print("\n🗃️ Step 3: Creating fresh migrations for PostgreSQL...")
    os.system("python manage.py makemigrations")
    
    print("\n🔄 Step 4: Running migrations on PostgreSQL...")
    os.system("python manage.py migrate")
    
    # Step 5: Load data into PostgreSQL
    print("\n📥 Step 5: Loading data into PostgreSQL...")
    os.system("python manage.py loaddata data_dump.json")
    
    print("\n🎉 Migration completed successfully!")
    print("   Your data has been migrated from SQLite to PostgreSQL (Supabase)")
    print("   You can now delete the data_dump.json file if everything looks good.")

def fresh_start():
    """
    Start fresh with PostgreSQL (no data migration)
    """
    print("🚀 Starting fresh setup with PostgreSQL...")
    
    print("\n🔧 Step 1: Update your .env file with Supabase PostgreSQL connection string")
    print("   Example: DATABASE_URL=postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres")
    print("   Make sure to replace 'your_password' and 'xxx' with your actual values")
    print("   Remove the 'sqlite' DATABASE_URL line and uncomment the PostgreSQL line")
    input("   Press Enter when you've updated your .env file...")
    
    print("\n🗃️ Step 2: Creating migrations...")
    os.system("python manage.py makemigrations")
    
    print("\n🔄 Step 3: Running migrations on PostgreSQL...")
    os.system("python manage.py migrate")
    
    print("\n👤 Step 4: Creating superuser...")
    os.system("python manage.py createsuperuser")
    
    print("\n🎉 Fresh PostgreSQL setup completed!")
    print("   Your Snake Game is now using Supabase PostgreSQL!")

if __name__ == "__main__":
    print("🐍 Snake Game: SQLite to PostgreSQL Migration Tool")
    print("=" * 50)
    
    choice = input("\nChoose an option:\n1. Migrate existing data from SQLite\n2. Fresh start (no data migration)\n\nEnter choice (1 or 2): ")
    
    if choice == "1":
        migrate_data()
    elif choice == "2":
        fresh_start()
    else:
        print("❌ Invalid choice. Please run the script again and choose 1 or 2.")
        sys.exit(1)
