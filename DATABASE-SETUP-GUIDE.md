# 🔧 Database Setup Instructions

## Issue: "Database error saving new user"

This error occurs because the required database tables and triggers are not set up in your Supabase project.

## Quick Fix Steps:

### 1. Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `mfsjbqwnxodmtyhizwpn`
3. Go to **SQL Editor** in the left sidebar

### 2. Run the Database Setup
1. Copy the entire content from `database-setup.sql` file
2. Paste it into the SQL Editor
3. Click **Run** to execute the setup

### 3. Verify Tables Created
Go to **Table Editor** and check that these tables exist:
- ✅ `profiles` - User profile information
- ✅ `wardrobe_items` - User's clothing items

### 4. Test User Registration
- Try creating a new account again
- The profile should be automatically created via database trigger

## What the Setup Does:

1. **Creates `profiles` table** - Stores user profile data
2. **Creates `wardrobe_items` table** - Stores clothing items
3. **Sets up Row Level Security (RLS)** - Ensures users only see their own data
4. **Creates automatic profile trigger** - Creates profile when user signs up
5. **Adds update triggers** - Automatically updates `updated_at` timestamps

## Alternative Quick Test:

If you want to test without the full setup, you can temporarily disable the profile creation by commenting out the trigger in the auth signup process.

## Environment Variables:

Make sure your `.env` file in the client directory has the correct values:
```
VITE_SUPABASE_URL=https://mfsjbqwnxodmtyhizwpn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing After Setup:
1. Try creating a new user account
2. Check the `profiles` table in Supabase to see if the profile was created
3. The error should be resolved