# Supabase Setup Guide

This guide will help you set up Supabase as the database for your Credit Tracker application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in:
   - **Project Name**: Credit Tracker (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" and wait for it to be ready (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: Copy this value
   - **anon/public key**: Copy this value (this is safe to use in client-side code)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace `your_project_url_here` and `your_anon_key_here` with the actual values from Step 2.

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" - this means the tables were created successfully

## Step 5: Configure Row Level Security (RLS)

The schema includes RLS policies, but since we're using user IDs from your app (not Supabase Auth), you have two options:

### Option A: Disable RLS (Simpler for now)

If you want to keep it simple and rely on your app's user_id filtering:

1. Go to **SQL Editor** in Supabase
2. Run this SQL:

```sql
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

### Option B: Keep RLS Enabled (More Secure)

If you want to use RLS, you'll need to modify the Supabase client to set the user context. This requires additional setup with Supabase Auth or custom functions.

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app should now connect to Supabase instead of localStorage
3. Create a test account and verify data is being saved to Supabase

## Step 7: Verify Data in Supabase

1. Go to **Table Editor** in your Supabase dashboard
2. You should see all the tables:
   - `users`
   - `customers`
   - `credits`
   - `payment_records`
   - `shop_info`
   - `staff`
   - `settings`
3. As you use the app, you should see data appearing in these tables

## Troubleshooting

### "Supabase environment variables are not set"
- Make sure your `.env.local` file exists and has the correct variable names
- Restart your development server after creating/updating `.env.local`
- Check that the values don't have extra spaces or quotes

### "Error fetching user data from Supabase"
- Check that you've run the schema SQL to create the tables
- Verify your API keys are correct
- Check the Supabase dashboard for any error logs

### Data not appearing in Supabase
- Check the browser console for errors
- Verify RLS policies if you kept them enabled
- Make sure the user_id matches between your app and the database

## Next Steps

- **For Production**: Set the environment variables in your Vercel project settings
- **For Security**: Consider implementing Supabase Auth instead of custom user IDs
- **For Performance**: Add more indexes as your data grows

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the console logs for specific error messages

