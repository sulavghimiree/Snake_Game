#!/usr/bin/env python
"""
Generate a new Django SECRET_KEY
"""
import secrets
import string

def generate_secret_key(length=50):
    """Generate a secure random secret key for Django"""
    # Characters to use in the secret key
    chars = string.ascii_letters + string.digits + '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    # Generate random secret key
    secret_key = ''.join(secrets.choice(chars) for _ in range(length))
    
    return secret_key

if __name__ == "__main__":
    print("🔑 Django SECRET_KEY Generator")
    print("=" * 40)
    
    # Generate a new secret key
    new_key = generate_secret_key()
    
    print(f"\n✅ New SECRET_KEY generated:")
    print(f"SECRET_KEY={new_key}")
    
    print(f"\n📝 How to use:")
    print("1. Copy the SECRET_KEY value above")
    print("2. Add it to your Render environment variables")
    print("3. Never share this key publicly!")
    print("4. Never commit this key to git!")
    
    print(f"\n🚀 For Render deployment:")
    print("Go to Render Dashboard → Your Service → Environment")
    print("Add: SECRET_KEY={new_key}")
