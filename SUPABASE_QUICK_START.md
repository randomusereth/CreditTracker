# Supabase Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Wait 2-3 minutes for it to be ready

### 2. Get Your Keys
- In Supabase Dashboard → Settings → API
- Copy **Project URL** and **anon/public key**

### 3. Add Environment Variables
Create `.env.local` in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Database Tables
- Go to Supabase Dashboard → SQL Editor
- Copy and paste the entire contents of `supabase/schema.sql`
- Click "Run"

### 5. Disable RLS (Optional - for simplicity)
Run this in SQL Editor:
```sql
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

### 6. Test It!
```bash
npm run dev
```

Your app will now use Supabase! 🎉

## 📝 For Vercel Deployment

Add these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ❓ Troubleshooting

**"Supabase environment variables are not set"**
- Check `.env.local` exists and has correct variable names
- Restart dev server after creating `.env.local`

**Data not saving?**
- Check browser console for errors
- Verify tables were created in Supabase
- Check RLS policies if you kept them enabled

## 📚 Full Documentation

See `SUPABASE_SETUP.md` for detailed instructions.

