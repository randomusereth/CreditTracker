# How to Debug Telegram Webhook 500 Errors

## 🔍 Step-by-Step Debugging Guide

### Step 1: Check Environment Variables

**Test if your environment variables are set correctly:**

1. **Visit this URL** (replace with your Vercel URL):
   ```
   https://your-app.vercel.app/api/telegram/test
   ```

2. **You should see** a JSON response showing which variables are set:
   ```json
   {
     "message": "Environment Variables Check",
     "status": {
       "TELEGRAM_BOT_TOKEN": "✅ Set",
       "SUPABASE_URL": "✅ Set",
       ...
     },
     "allSet": true
   }
   ```

3. **If any show "❌ Missing"**, add them in Vercel Dashboard → Settings → Environment Variables

### Step 2: Check Vercel Function Logs

**This is the BEST way to see what's failing:**

1. Go to **Vercel Dashboard** → Your Project
2. Click on **"Functions"** tab (or "Deployments" → Latest deployment → "Functions")
3. Find `/api/telegram/webhook` in the list
4. Click on it to see **invocation logs**
5. Look for **error messages** in red

**What to look for:**
- `TELEGRAM_BOT_TOKEN environment variable is not set`
- `Supabase environment variables are not set`
- `Error fetching customer: ...`
- `Error getting user ID: ...`
- Any stack traces

### Step 3: Test Webhook Manually

**Send a test request to your webhook:**

**Using PowerShell:**
```powershell
$body = @{
    update_id = 123456
    message = @{
        message_id = 1
        from = @{
            id = 123456789
            is_bot = $false
            first_name = "Test"
        }
        chat = @{
            id = 123456789
            type = "private"
        }
        date = [int](Get-Date -UFormat %s)
        text = "+251912345678"
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "https://your-app.vercel.app/api/telegram/webhook" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Check the response** - it should return `{"ok":true}` or show an error message.

### Step 4: Check Telegram Webhook Info

**See what Telegram sees:**

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

**Look for:**
- `last_error_message`: The actual error
- `pending_update_count`: How many messages are waiting
- `last_error_date`: When the last error occurred

### Step 5: Common Issues and Fixes

#### Issue 1: "Bot token not configured"
**Fix:** Add `TELEGRAM_BOT_TOKEN` in Vercel Dashboard

#### Issue 2: "Database not configured"
**Fix:** Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (without VITE_ prefix) in Vercel Dashboard

#### Issue 3: "Cannot read property 'from' of undefined"
**Fix:** Request body parsing issue - check logs for body format

#### Issue 4: Supabase query errors
**Fix:** 
- Check if tables exist in Supabase
- Verify RLS policies allow queries
- Check column names match schema

#### Issue 5: "User not found"
**Fix:** User needs to open mini app first to create account

### Step 6: Enable Detailed Logging

The webhook handler now logs:
- Request method and body type
- Update ID and message presence
- All errors with stack traces
- Supabase query results

**Check Vercel function logs** to see these details.

## 📊 Quick Debug Checklist

- [ ] Environment variables test endpoint shows all ✅
- [ ] Vercel function logs show detailed error messages
- [ ] Telegram webhook info shows current error
- [ ] Supabase tables exist and have data
- [ ] User is registered (has telegram_id in users table)
- [ ] Customer exists with matching phone number

## 🆘 Still Stuck?

1. **Copy the exact error** from Vercel function logs
2. **Check the webhook info** from Telegram
3. **Share the error message** and I can help fix it!

## 🔗 Useful Links

- **Test endpoint**: `https://your-app.vercel.app/api/telegram/test`
- **Webhook info**: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- **Vercel logs**: Vercel Dashboard → Project → Functions → webhook

