# Supabase PostgreSQL Setup Guide

## Step 1: Create Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization (create one if needed)
5. Fill in project details:
   - **Name**: `snake-game` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Start with the free tier
6. Click "Create new project"
7. Wait for the project to be created (this takes a few minutes)

## Step 2: Get Database Connection Details

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection info**
3. You'll see connection details like:
   - **Host**: `db.your-project-ref.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: The password you set during project creation

## Step 3: Get Connection String

1. In the same **Settings** → **Database** page
2. Look for **Connection string** section
3. Select **URI** tab
4. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 4: Update Environment Variables

Update your `backend/.env` file with the Supabase connection string:

```env
# Replace the DATABASE_URL line with your Supabase connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

## Step 5: Enable RLS (Row Level Security) - Optional

If you want to use Supabase's Row Level Security features:

1. Go to **Authentication** → **Settings**
2. Enable RLS on tables as needed
3. Set up authentication policies if required

## Step 6: Migrate Database

After updating your `.env` file, run the following commands:

```bash
# In your backend directory
python manage.py makemigrations
python manage.py migrate
```

## Step 7: Create Superuser (Optional)

Create a new Django superuser for your PostgreSQL database:

```bash
python manage.py createsuperuser
```

## Troubleshooting

### Connection Issues

- Make sure your IP address is allowed in Supabase (usually allowed by default)
- Verify the connection string is correct
- Check that the password doesn't contain special characters that need URL encoding

### Migration Issues

- If you have existing data, consider using `python manage.py dumpdata` before switching
- For a fresh start, you can delete migration files (except `__init__.py`) and run `makemigrations` again

### Performance Optimization

- Supabase free tier has connection limits
- Use connection pooling in production
- Consider using `conn_max_age` in database settings (already configured)

## Security Notes

- Never commit your actual database credentials to version control
- Use environment variables for all sensitive data
- Consider using Supabase's built-in authentication features
- Enable SSL connections (enabled by default with Supabase)

## Supabase Dashboard Features

- **Table Editor**: Visual interface to view/edit data
- **SQL Editor**: Run custom SQL queries
- **Authentication**: Built-in user management
- **Real-time**: WebSocket subscriptions
- **Storage**: File uploads and management
- **Edge Functions**: Serverless functions
