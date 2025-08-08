import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

print("OnlinePlayer table structure:")
cursor.execute('PRAGMA table_info(game_onlineplayer)')
onlineplayer_info = cursor.fetchall()
for row in onlineplayer_info:
    print(f"  {row}")

if not onlineplayer_info:
    print("  Table does not exist!")

# Check foreign key info
print("\nForeign key constraints:")
cursor.execute('PRAGMA foreign_key_list(game_onlineplayer)')
fk_info = cursor.fetchall()
for row in fk_info:
    print(f"  {row}")

conn.close()
