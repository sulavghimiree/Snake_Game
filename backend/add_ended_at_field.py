import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("Adding ended_at field to GameSession table...")

try:
    cursor.execute('ALTER TABLE game_gamesession ADD COLUMN ended_at datetime NULL')
    print("✅ Added ended_at field")
except Exception as e:
    print(f"Error adding field: {e}")

conn.commit()
conn.close()
print("Done!")
