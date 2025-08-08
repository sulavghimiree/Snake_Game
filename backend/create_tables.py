import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(__file__))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'snake_backend.settings')

# Setup Django
django.setup()

from django.db import connection

cursor = connection.cursor()

# Create the missing tables for the custom user model
print("Creating missing tables...")

try:
    # Create game_user_groups table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS "game_user_groups" (
            "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
            "user_id" bigint NOT NULL REFERENCES "game_user" ("id") DEFERRABLE INITIALLY DEFERRED, 
            "group_id" integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED
        )
    """)
    print("✅ game_user_groups table created")

    # Create game_user_user_permissions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS "game_user_user_permissions" (
            "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
            "user_id" bigint NOT NULL REFERENCES "game_user" ("id") DEFERRABLE INITIALLY DEFERRED, 
            "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED
        )
    """)
    print("✅ game_user_user_permissions table created")

    # Create game_onlineplayer table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS "game_onlineplayer" (
            "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
            "last_ping" datetime NOT NULL, 
            "current_game_id" bigint NULL REFERENCES "game_gamesession" ("id") DEFERRABLE INITIALLY DEFERRED, 
            "user_id" bigint NOT NULL UNIQUE REFERENCES "game_user" ("id") DEFERRABLE INITIALLY DEFERRED
        )
    """)
    print("✅ game_onlineplayer table created")

    # Create indexes
    cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS "game_user_groups_user_id_group_id_3b5093d9_uniq" ON "game_user_groups" ("user_id", "group_id")')
    cursor.execute('CREATE INDEX IF NOT EXISTS "game_user_groups_user_id_e50a4c1a" ON "game_user_groups" ("user_id")')
    cursor.execute('CREATE INDEX IF NOT EXISTS "game_user_groups_group_id_3c872bc4" ON "game_user_groups" ("group_id")')
    cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS "game_user_user_permissions_user_id_permission_id_2a61e9a9_uniq" ON "game_user_user_permissions" ("user_id", "permission_id")')
    cursor.execute('CREATE INDEX IF NOT EXISTS "game_user_user_permissions_user_id_9e296943" ON "game_user_user_permissions" ("user_id")')
    cursor.execute('CREATE INDEX IF NOT EXISTS "game_user_user_permissions_permission_id_f54a1ba7" ON "game_user_user_permissions" ("permission_id")')
    cursor.execute('CREATE INDEX IF NOT EXISTS "game_onlineplayer_current_game_id_43d1e3c8" ON "game_onlineplayer" ("current_game_id")')
    print("✅ Indexes created")

    print("\n🎉 All tables created successfully!")

except Exception as e:
    print(f"❌ Error: {e}")

print("\nFinal table list:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
for table in sorted(tables):
    print(f"  - {table}")
