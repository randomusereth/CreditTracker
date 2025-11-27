# Vite Environment Variables Setup

## ⚠️ Important: Vite Uses Different Syntax!

Since your project uses **Vite** (not Next.js), you need to use `VITE_` prefix instead of `NEXT_PUBLIC_`.

## Update Your .env.local File

Change your `.env.local` file to use `VITE_` prefix:

```env
# Supabase Configuration for Vite
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**NOT** `NEXT_PUBLIC_SUPABASE_URL` - that's for Next.js projects!

## Quick Fix Steps

1. **Update your `.env.local` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **The white screen should be fixed!**

## Why This Happened

- **Next.js** uses: `process.env.NEXT_PUBLIC_*`
- **Vite** uses: `import.meta.env.VITE_*`

The code has been updated to support both, but you should use `VITE_` prefix for Vite projects.

## For Vercel Deployment

When deploying to Vercel, add these environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Verification

After updating, check the browser console - you should NOT see:
- "process is not defined" error
- "Supabase environment variables are not set" warning

The app should load normally!

