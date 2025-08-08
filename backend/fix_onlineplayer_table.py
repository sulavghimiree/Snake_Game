import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("Fixing OnlinePlayer table foreign key constraint...")

# First, rename the old table
try:
    cursor.execute('ALTER TABLE game_onlineplayer RENAME TO game_onlineplayer_old')
    print("✅ Renamed old OnlinePlayer table")
except Exception as e:
    print(f"Error renaming table: {e}")

# Create the new table with correct foreign key reference
try:
    cursor.execute("""
        CREATE TABLE "game_onlineplayer" (
            "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
            "last_ping" datetime NOT NULL,
            "current_game_id" bigint NULL REFERENCES "game_gamesession" ("id") DEFERRABLE INITIALLY DEFERRED,
            "user_id" bigint NOT NULL UNIQUE REFERENCES "game_user" ("id") DEFERRABLE INITIALLY DEFERRED
        )
    """)
    print("✅ Created new OnlinePlayer table")
except Exception as e:
    print(f"Error creating new table: {e}")

# Create indexes
try:
    cursor.execute('CREATE INDEX "game_onlineplayer_current_game_id_a1c1c40f" ON "game_onlineplayer" ("current_game_id")')
    cursor.execute('CREATE UNIQUE INDEX "game_onlineplayer_user_id_a4ef3d2c_uniq" ON "game_onlineplayer" ("user_id")')
    print("✅ Created indexes")
except Exception as e:
    print(f"Error creating indexes: {e}")

# Drop the old table
try:
    cursor.execute('DROP TABLE IF EXISTS game_onlineplayer_old')
    print("✅ Dropped old table")
except Exception as e:
    print(f"Error dropping old table: {e}")

conn.commit()
conn.close()
print("Done!")
