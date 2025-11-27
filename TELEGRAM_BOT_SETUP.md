# Telegram Bot Setup Guide

This guide explains how to set up the Telegram bot feature that allows users to query customer credit information via Telegram chat.

## Overview

The bot allows shop owners to:
1. Send a customer phone number to the bot in Telegram
2. Receive customer credit information summary
3. Click an inline button to open the customer detail page in the mini app

## Prerequisites

1. **Telegram Bot Token**: You need a bot token from @BotFather
2. **Vercel Deployment**: Your app must be deployed on Vercel
3. **Environment Variables**: Set up in Vercel dashboard

## Setup Steps

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Set Environment Variables in Vercel

**⚠️ IMPORTANT: You MUST add these in Vercel Dashboard (not just .env.local)**

Go to your Vercel project dashboard → Settings → Environment Variables and add:

**For the API route (serverless function) - REQUIRED:**
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MINI_APP_URL=https://your-actual-vercel-url.vercel.app
```

**For the frontend (React app) - Also add:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Why two sets?**
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` (no prefix) = Used by API route (backend)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (with VITE_ prefix) = Used by frontend (client-side)

**Note:** `.env.local` is optional and only for local development. The webhook runs on Vercel, so Vercel Dashboard variables are REQUIRED.

**See `ENV_VARIABLES_GUIDE.md` for detailed explanation.**

### 3. Set Webhook URL

**What is a Webhook?**
A webhook is like a phone number that Telegram calls whenever someone sends a message to your bot. Instead of your bot constantly asking "Any new messages?", Telegram automatically notifies your server instantly.

**After deploying to Vercel, set the webhook URL for your bot:**

**Method 1: Using Browser (Easiest)**
1. Replace `<YOUR_BOT_TOKEN>` with your actual bot token
2. Replace `your-app.vercel.app` with your actual Vercel URL
3. Open this URL in your browser:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook
```

**Example:**
```
https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/setWebhook?url=https://credit-tracker.vercel.app/api/telegram/webhook
```

You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

**Method 2: Using PowerShell (Windows)**
```powershell
$botToken = "YOUR_BOT_TOKEN"
$webhookUrl = "https://your-app.vercel.app/api/telegram/webhook"
Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=$webhookUrl" -Method POST
```

**Method 3: Using cURL**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook"
```

### 4. Verify Webhook

Check if webhook is set correctly by opening this URL in your browser:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-app.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

**See `WEBHOOK_EXPLAINED.md` for detailed explanation of webhooks.**

## How It Works

1. **User sends phone number** to the bot in Telegram
2. **Bot extracts phone number** from the message
3. **Bot queries Supabase** to find customer by phone number
4. **Bot calculates credit summary**:
   - Total credits
   - Total paid
   - Outstanding amount
   - Unpaid/partially paid counts
5. **Bot sends formatted response** with inline button
6. **User clicks button** to open mini app with customer detail page

## API Route

The webhook handler is located at:
- **File**: `api/telegram/webhook.ts`
- **Endpoint**: `/api/telegram/webhook`
- **Method**: POST (Telegram sends updates here)

## Deep Link Format

The mini app deep link format is:
```
https://your-app.vercel.app?customerId=<customer_id>
```

When opened, the app will:
1. Check for `customerId` in URL parameters
2. Navigate directly to customer detail page
3. Clean up the URL (remove query parameters)

## Testing

1. **Test locally** (using ngrok or similar):
   ```bash
   # Install ngrok
   ngrok http 3000
   
   # Set webhook to ngrok URL
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/telegram/webhook"
   ```

2. **Test in production**:
   - Deploy to Vercel
   - Set webhook to production URL
   - Send a phone number to your bot
   - Verify response and inline button

## Troubleshooting

### Bot not responding
- Check if webhook is set correctly
- Verify bot token in environment variables
- Check Vercel function logs

### Customer not found
- Ensure customer exists in Supabase
- Verify phone number format matches (Ethiopian format: +251... or 0...)
- Check user is registered (has telegram_id in users table)

### Deep link not working
- Verify MINI_APP_URL is set correctly
- Check customerId parameter in URL
- Ensure customer exists in app state

## Security Notes

- Bot token should be kept secret (use environment variables)
- Webhook should only accept POST requests
- Verify user is registered before querying data
- Phone number validation prevents SQL injection

## Support

For issues or questions, check:
- Vercel function logs
- Telegram Bot API documentation
- Supabase query logs

