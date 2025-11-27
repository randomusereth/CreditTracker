# Environment Variables Setup Guide

## Required Environment Variables

You need to create a `.env.local` file in the root of your project with the following variables:

### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get These Values

### Step 1: Create/Open Your Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Select your project (or create a new one)

### Step 2: Get Your API Keys
1. In your Supabase dashboard, click on **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:

   **Project URL:**
   - Look for "Project URL" or "URL"
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Copy this entire URL

   **anon public key:**
   - Look for "Project API keys"
   - Find the key labeled "anon" or "public"
   - It's a long JWT token starting with `eyJ...`
   - Copy this entire key

### Step 3: Create Your .env.local File

1. In your project root directory, create a file named `.env.local`
2. Add your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

**Important Notes:**
- Replace `your-actual-project-id` with your real Supabase project ID
- Replace `your-actual-key-here` with your real anon key
- Don't include quotes around the values
- Don't add spaces before or after the `=` sign
- The `.env.local` file is already in `.gitignore` so it won't be committed to git

## Example .env.local File

Here's what a complete `.env.local` file should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

## For Vercel Deployment

When deploying to Vercel, you need to add these same environment variables:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key
4. Make sure to add them for all environments (Production, Preview, Development)

## Verification

After setting up your `.env.local` file:

1. **Restart your development server** (important!)
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

2. Check the browser console - you should NOT see:
   ```
   "Supabase environment variables are not set. Using localStorage fallback."
   ```

3. If you see that warning, double-check:
   - File is named exactly `.env.local` (not `.env` or `.env.example`)
   - File is in the project root directory
   - No typos in variable names
   - You restarted the dev server after creating the file

## Security Notes

- ✅ The `anon` key is safe to use in client-side code (it's public)
- ✅ The `.env.local` file is in `.gitignore` and won't be committed
- ❌ Never commit your `.env.local` file to git
- ❌ Don't share your keys publicly
- ⚠️ The anon key has limited permissions based on your RLS policies

## Troubleshooting

**"Supabase environment variables are not set"**
- Make sure the file is named `.env.local` (not `.env`)
- Check for typos in variable names (must be exact: `NEXT_PUBLIC_SUPABASE_URL`)
- Restart your dev server after creating/updating the file
- Check that values don't have quotes or extra spaces

**Variables not loading?**
- In Next.js, only variables starting with `NEXT_PUBLIC_` are available in the browser
- Make sure you're using the correct prefix
- Try logging: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)` (should work in client components)

