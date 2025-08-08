import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("Updating GameSession table structure...")

# First, rename the old table
try:
    cursor.execute('ALTER TABLE game_gamesession RENAME TO game_gamesession_old')
    print("✅ Renamed old table")
except Exception as e:
    print(f"Error renaming table: {e}")

# Create the new table with correct structure
try:
    cursor.execute("""
        CREATE TABLE "game_gamesession" (
            "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
            "user_id" bigint NOT NULL REFERENCES "game_user" ("id") DEFERRABLE INITIALLY DEFERRED,
            "score" integer NOT NULL,
            "game_data" text NOT NULL,
            "created_at" datetime NOT NULL,
            "updated_at" datetime NOT NULL,
            "is_active" boolean NOT NULL
        )
    """)
    print("✅ Created new GameSession table")
except Exception as e:
    print(f"Error creating new table: {e}")

# Create index for user_id
try:
    cursor.execute('CREATE INDEX "game_gamesession_user_id_a8267b7b" ON "game_gamesession" ("user_id")')
    print("✅ Created user_id index")
except Exception as e:
    print(f"Error creating index: {e}")

# Drop the old table
try:
    cursor.execute('DROP TABLE IF EXISTS game_gamesession_old')
    print("✅ Dropped old table")
except Exception as e:
    print(f"Error dropping old table: {e}")

conn.commit()
conn.close()
print("Done!")
