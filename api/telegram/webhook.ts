/**
 * TELEGRAM BOT WEBHOOK HANDLER
 * Handles incoming messages from Telegram bot
 * 
 * Endpoint: /api/telegram/webhook
 * Method: POST
 * 
 * This webhook receives messages from Telegram and responds with customer credit information
 */

import { createClient } from '@supabase/supabase-js';

// Telegram Bot API URL
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

// Get bot token from environment variable
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Supabase configuration
// For serverless functions, use process.env directly (not VITE_ prefix)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mini app URL (update this with your actual Vercel deployment URL)
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-app.vercel.app';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

interface CustomerCreditInfo {
  customerId: string;
  customerName: string;
  phone: string;
  totalCredits: number;
  totalPaid: number;
  totalOutstanding: number;
  unpaidCount: number;
  partiallyPaidCount: number;
}

/**
 * Extract phone number from message text
 */
function extractPhoneNumber(text: string): string | null {
  // Remove all whitespace and special characters except + and digits
  const cleaned = text.replace(/[^\d+]/g, '');
  
  // Check for Ethiopian phone formats: +251... or 0...
  const ethiopianRegex = /^(\+251|0)[79]\d{8}$/;
  
  if (ethiopianRegex.test(cleaned)) {
    // Normalize to +251 format
    if (cleaned.startsWith('0')) {
      return '+251' + cleaned.substring(1);
    }
    return cleaned;
  }
  
  // Try to find phone number in text (any format)
  const phoneRegex = /(\+?\d{10,15})/;
  const match = text.match(phoneRegex);
  if (match) {
    return match[1];
  }
  
  return null;
}

/**
 * Get customer credit information from Supabase
 */
async function getCustomerCreditInfo(
  userId: string,
  phoneNumber: string
): Promise<CustomerCreditInfo | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    // Find customer by phone number for this user
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('user_id', userId)
      .eq('phone', phoneNumber)
      .maybeSingle();

    if (customerError || !customer) {
      return null;
    }

    // Get all credits for this customer
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('total_amount, paid_amount, remaining_amount, status')
      .eq('user_id', userId)
      .eq('customer_id', customer.id);

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return null;
    }

    // Handle case where credits is null or undefined
    if (!credits) {
      credits = [];
    }

    // Calculate totals
    const totalCredits = credits.reduce((sum, c) => sum + parseFloat(c.total_amount.toString()), 0);
    const totalPaid = credits.reduce((sum, c) => sum + parseFloat(c.paid_amount.toString()), 0);
    const totalOutstanding = credits.reduce((sum, c) => sum + parseFloat(c.remaining_amount.toString()), 0);
    const unpaidCount = credits.filter(c => c.status === 'unpaid').length;
    const partiallyPaidCount = credits.filter(c => c.status === 'partially-paid').length;

    return {
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      totalCredits,
      totalPaid,
      totalOutstanding,
      unpaidCount,
      partiallyPaidCount,
    };
  } catch (error) {
    console.error('Error getting customer credit info:', error);
    return null;
  }
}

/**
 * Get user ID from Telegram user ID
 */
async function getUserIdFromTelegramId(telegramId: string): Promise<string | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by telegram ID:', error);
      return null;
    }

    if (!data) {
      console.log(`No user found with telegram_id: ${telegramId}`);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Format credit info message
 */
function formatCreditMessage(info: CustomerCreditInfo): string {
  const { customerName, totalCredits, totalPaid, totalOutstanding, unpaidCount, partiallyPaidCount } = info;

  let message = `📊 *Credit Information*\n\n`;
  message += `👤 *Customer:* ${customerName}\n\n`;
  message += `💰 *Total Credits:* ${totalCredits.toFixed(2)} ETB\n`;
  message += `✅ *Total Paid:* ${totalPaid.toFixed(2)} ETB\n`;
  message += `⚠️ *Outstanding:* ${totalOutstanding.toFixed(2)} ETB\n\n`;

  if (unpaidCount > 0 || partiallyPaidCount > 0) {
    message += `📋 *Summary:*\n`;
    if (unpaidCount > 0) {
      message += `• Unpaid: ${unpaidCount}\n`;
    }
    if (partiallyPaidCount > 0) {
      message += `• Partially Paid: ${partiallyPaidCount}\n`;
    }
  } else {
    message += `✅ All credits are paid!`;
  }

  return message;
}

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(chatId: number, text: string, replyToMessageId?: number, inlineKeyboard?: any) {
  const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`;
  
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
  };

  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }

  if (inlineKeyboard) {
    payload.reply_markup = {
      inline_keyboard: inlineKeyboard,
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Main webhook handler
 * Vercel serverless function format
 */
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify bot token is set
  if (!BOT_TOKEN) {
    const errorMsg = 'TELEGRAM_BOT_TOKEN environment variable is not set';
    console.error(errorMsg);
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('TELEGRAM') || k.includes('SUPABASE')));
    return res.status(500).json({ 
      error: 'Bot token not configured',
      details: 'TELEGRAM_BOT_TOKEN environment variable is missing. Please add it in Vercel Dashboard → Settings → Environment Variables'
    });
  }

  // Verify Supabase is configured
  if (!supabase) {
    const errorMsg = 'Supabase environment variables are not set';
    console.error(errorMsg);
    console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.error('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    return res.status(500).json({ 
      error: 'Database not configured',
      details: 'SUPABASE_URL and SUPABASE_ANON_KEY must be set in Vercel Dashboard (without VITE_ prefix for API routes)'
    });
  }

  try {
    // Log request for debugging
    console.log('Webhook received - Method:', req.method);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', req.body ? Object.keys(req.body) : 'null/undefined');
    
    // Parse request body - Vercel serverless functions may send body as string
    let update: TelegramUpdate;
    
    if (typeof req.body === 'string') {
      try {
        update = JSON.parse(req.body);
        console.log('Parsed body from string');
      } catch (parseError: any) {
        console.error('Failed to parse request body:', parseError?.message);
        console.error('Request body (first 500 chars):', req.body?.substring(0, 500));
        return res.status(400).json({ error: 'Invalid JSON in request body', details: parseError?.message });
      }
    } else if (req.body && typeof req.body === 'object') {
      update = req.body;
      console.log('Using body as object');
    } else {
      console.error('Unexpected request body type:', typeof req.body);
      console.error('Request body value:', req.body);
      return res.status(400).json({ error: 'Invalid request body', details: `Expected string or object, got ${typeof req.body}` });
    }
    
    console.log('Update ID:', update?.update_id);
    console.log('Has message:', !!update?.message);

    // Check if this is a message update
    if (!update || !update.message || !update.message.text) {
      // Not a text message, return success (could be other update types)
      return res.status(200).json({ ok: true });
    }

    const message = update.message;
    const telegramUserId = message.from.id.toString();
    const messageText = message.text.trim();

    // Get user ID from Telegram ID
    const userId = await getUserIdFromTelegramId(telegramUserId);
    
    if (!userId) {
      await sendTelegramMessage(
        message.chat.id,
        '❌ You are not registered in the system. Please open the mini app first to create your account.',
        message.message_id
      );
      return res.status(200).json({ ok: true });
    }

    // Extract phone number from message
    const phoneNumber = extractPhoneNumber(messageText);

    if (!phoneNumber) {
      await sendTelegramMessage(
        message.chat.id,
        '📱 Please send a valid phone number.\n\nExample: +251912345678 or 0912345678',
        message.message_id
      );
      return res.status(200).json({ ok: true });
    }

    // Get customer credit information
    const creditInfo = await getCustomerCreditInfo(userId, phoneNumber);

    if (!creditInfo) {
      await sendTelegramMessage(
        message.chat.id,
        `❌ No customer found with phone number: ${phoneNumber}\n\nPlease check the phone number and try again.`,
        message.message_id
      );
      return res.status(200).json({ ok: true });
    }

    // Format and send response
    const responseMessage = formatCreditMessage(creditInfo);
    
    // Create inline button to open mini app
    const inlineKeyboard = [
      [
        {
          text: '📱 View Details in Mini App',
          web_app: {
            url: `${MINI_APP_URL}?customerId=${creditInfo.customerId}`,
          },
        },
      ],
    ];

    await sendTelegramMessage(
      message.chat.id,
      responseMessage,
      message.message_id,
      inlineKeyboard
    );

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    
    // Try to send error message to user if we have chat info
    try {
      if (req.body?.message?.chat?.id) {
        await sendTelegramMessage(
          req.body.message.chat.id,
          '❌ An error occurred while processing your request. Please try again later.',
          req.body.message.message_id
        );
      }
    } catch (sendError) {
      console.error('Failed to send error message to user:', sendError);
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error'
    });
  }
}

