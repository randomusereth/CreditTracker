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

Go to your Vercel project dashboard → Settings → Environment Variables and add:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
MINI_APP_URL=https://your-app.vercel.app
```

**Note**: For the API route, you also need to add these without the `VITE_` prefix:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Webhook URL

After deploying to Vercel, set the webhook URL for your bot:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.vercel.app/api/telegram/webhook"}'
```

Or use this URL format:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook
```

### 4. Verify Webhook

Check if webhook is set correctly:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

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

