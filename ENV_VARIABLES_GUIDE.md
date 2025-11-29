# Environment Variables Guide

## 📍 Where to Add Environment Variables

### **For Vercel Deployment (REQUIRED for Bot to Work)**

**You MUST add these in Vercel Dashboard:**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MINI_APP_URL=https://your-actual-vercel-url.vercel.app
```

**Important Notes:**
- For the **API route** (`api/telegram/webhook.ts`), use `SUPABASE_URL` and `SUPABASE_ANON_KEY` (NO `VITE_` prefix)
- These are used by the serverless function (backend)
- The webhook will NOT work without these!

### **For Local Development (Optional)**

**Only if you want to test locally:**

Create a `.env.local` file in the root directory:

```env
# For frontend (Vite) - use VITE_ prefix
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# For API route testing (if testing webhook locally)
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MINI_APP_URL=http://localhost:3000
```

**Note:** `.env.local` is already in `.gitignore`, so it won't be committed to Git.

## 🔑 Environment Variables Summary

### **Vercel Dashboard (Production) - REQUIRED:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot authentication | `123456789:ABCdef...` |
| `SUPABASE_URL` | Database connection (API route) | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Database key (API route) | `eyJhbGc...` |
| `MINI_APP_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `VITE_SUPABASE_URL` | Database connection (frontend) | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Database key (frontend) | `eyJhbGc...` |

### **Why Two Sets of Supabase Variables?**

- **`VITE_SUPABASE_URL`** / **`VITE_SUPABASE_ANON_KEY`**: Used by frontend (React app)
  - Vite requires `VITE_` prefix to expose variables to client-side code
  
- **`SUPABASE_URL`** / **`SUPABASE_ANON_KEY`**: Used by API route (serverless function)
  - Serverless functions use `process.env` directly (no prefix needed)

## ✅ Quick Checklist

- [ ] Added `TELEGRAM_BOT_TOKEN` in Vercel Dashboard
- [ ] Added `SUPABASE_URL` in Vercel Dashboard (without VITE_ prefix)
- [ ] Added `SUPABASE_ANON_KEY` in Vercel Dashboard (without VITE_ prefix)
- [ ] Added `MINI_APP_URL` in Vercel Dashboard (your actual Vercel URL)
- [ ] Added `VITE_SUPABASE_URL` in Vercel Dashboard (with VITE_ prefix)
- [ ] Added `VITE_SUPABASE_ANON_KEY` in Vercel Dashboard (with VITE_ prefix)
- [ ] Redeployed after adding variables (or wait for auto-deploy)

## 🧪 Testing

After adding variables in Vercel:

1. **Redeploy** your project (or wait for auto-deploy)
2. **Check webhook status:**
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```
3. **Send a test message** to your bot with a phone number
4. **Check Vercel function logs** if there are errors

## ⚠️ Important

- **`.env.local`** is for local development only
- **Vercel Dashboard** variables are for production (REQUIRED)
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Always use your **actual Vercel URL** (not the placeholder)




