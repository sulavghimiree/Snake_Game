import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("GameSession table structure:")
cursor.execute('PRAGMA table_info(game_gamesession)')
gamesession_info = cursor.fetchall()
for row in gamesession_info:
    print(f"  {row}")

if not gamesession_info:
    print("  Table does not exist!")

print("\nUser table structure:")
cursor.execute('PRAGMA table_info(game_user)')
user_info = cursor.fetchall()
for row in user_info:
    print(f"  {row}")

if not user_info:
    print("  Table does not exist!")

conn.close()
