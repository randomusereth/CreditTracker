# What is a Webhook? - Simple Explanation

## 🤔 What is a Webhook?

A **webhook** is like a phone number that Telegram calls whenever someone sends a message to your bot.

Think of it this way:
- **Without webhook**: Your bot has to constantly ask Telegram "Do I have any new messages?" (polling)
- **With webhook**: Telegram automatically calls your server and says "Hey, someone sent your bot a message!" (push notification)

## 📞 Real-World Analogy

Imagine:
- **Polling** = You keep calling your friend every 5 minutes asking "Did anyone call me?"
- **Webhook** = Your friend calls you immediately when someone tries to reach you

Webhooks are much more efficient!

## 🔧 How It Works for Telegram Bots

1. **User sends message** to your bot in Telegram
2. **Telegram receives** the message
3. **Telegram calls your webhook URL** (sends HTTP POST request to your server)
4. **Your server processes** the message and responds
5. **Bot sends reply** back to the user

## 🌐 Your Webhook URL

Your webhook URL is the address where Telegram will send messages:

```
https://your-app.vercel.app/api/telegram/webhook
```

This is where your `api/telegram/webhook.ts` file will receive messages.

## 📝 How to Set the Webhook

### Method 1: Using Browser (Easiest)

1. **Get your bot token** from @BotFather
2. **Get your Vercel deployment URL** (e.g., `https://credit-tracker.vercel.app`)
3. **Open this URL in your browser** (replace with your values):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook
```

**Example:**
```
https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/setWebhook?url=https://credit-tracker.vercel.app/api/telegram/webhook
```

4. **You should see a response** like:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Method 2: Using cURL (Command Line)

**Windows (PowerShell):**
```powershell
$botToken = "YOUR_BOT_TOKEN"
$webhookUrl = "https://your-app.vercel.app/api/telegram/webhook"
Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=$webhookUrl" -Method POST
```

**Mac/Linux:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook"
```

### Method 3: Using Postman or Similar Tool

1. **Method**: POST
2. **URL**: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook`
3. **Body** (JSON):
```json
{
  "url": "https://your-app.vercel.app/api/telegram/webhook"
}
```

## ✅ Verify Webhook is Set

Check if your webhook is configured correctly:

**Browser:**
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

**cURL:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
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

## 🔄 Update Webhook

If you need to change the webhook URL, just call `setWebhook` again with the new URL.

## 🗑️ Remove Webhook

To remove the webhook (stop receiving updates):

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook
```

## ⚠️ Important Notes

1. **HTTPS Required**: Your webhook URL must use HTTPS (not HTTP)
   - ✅ `https://your-app.vercel.app/api/telegram/webhook`
   - ❌ `http://your-app.vercel.app/api/telegram/webhook`

2. **Deploy First**: Make sure your app is deployed to Vercel before setting the webhook

3. **Environment Variables**: Ensure all environment variables are set in Vercel:
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `MINI_APP_URL`

4. **One Webhook Per Bot**: Each bot can only have one webhook URL at a time

## 🧪 Testing Locally

If you want to test locally before deploying:

1. **Use ngrok** to create a public URL for your local server:
   ```bash
   ngrok http 3000
   ```

2. **Set webhook to ngrok URL**:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-ngrok-url.ngrok.io/api/telegram/webhook
   ```

3. **Test your bot** - messages will be forwarded to your local server

4. **Remember to update webhook** to production URL after deployment!

## 📊 Webhook vs Polling

| Feature | Webhook | Polling |
|---------|---------|---------|
| Efficiency | ✅ Instant | ❌ Delayed (checks every few seconds) |
| Server Load | ✅ Low | ❌ High (constant requests) |
| Setup | ⚠️ Requires public URL | ✅ Works anywhere |
| Best For | Production | Development/Testing |

## 🎯 Summary

**Webhook = Telegram's way of instantly notifying your server when someone messages your bot**

**To set it:**
1. Deploy your app to Vercel
2. Get your deployment URL
3. Call Telegram API with: `setWebhook?url=https://your-app.vercel.app/api/telegram/webhook`
4. Verify it worked with `getWebhookInfo`

That's it! Once set, Telegram will automatically send all bot messages to your server.

