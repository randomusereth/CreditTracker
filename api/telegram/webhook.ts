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
 * Normalize phone number to multiple formats for searching
 */
function getPhoneNumberVariants(phone: string): string[] {
  const variants: string[] = [];
  
  // Add the original format
  variants.push(phone);
  
  // If it's in +251 format, also try 0 format
  if (phone.startsWith('+251')) {
    const localFormat = '0' + phone.substring(4);
    variants.push(localFormat);
    // Also try without leading 0
    variants.push(phone.substring(4));
  }
  
  // If it's in 0 format, also try +251 format
  if (phone.startsWith('0')) {
    const intlFormat = '+251' + phone.substring(1);
    variants.push(intlFormat);
    // Also try without leading 0
    variants.push(phone.substring(1));
  }
  
  // If it's just digits (9 digits), try both formats
  if (/^\d{9}$/.test(phone)) {
    variants.push('+251' + phone);
    variants.push('0' + phone);
  }
  
  // Remove duplicates
  return [...new Set(variants)];
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
    // Get all phone number variants to search
    const phoneVariants = getPhoneNumberVariants(phoneNumber);
    console.log('Searching for phone number variants:', phoneVariants);
    console.log('Original phone number:', phoneNumber);
    
    // Try to find customer by phone number (try all variants)
    // Use .in() to search for any of the variants
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('user_id', userId)
      .in('phone', phoneVariants);

    if (customerError) {
      console.error('Error fetching customer:', customerError);
      return null;
    }

    // If no customer found, log for debugging
    if (!customers || customers.length === 0) {
      console.log('No customer found with any of these phone variants:', phoneVariants);
      // Let's also check what phone numbers exist for this user
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('phone')
        .eq('user_id', userId)
        .limit(10);
      console.log('Sample phone numbers in database for this user:', allCustomers?.map(c => c.phone));
      return null;
    }

    // Use the first matching customer
    const customer = customers[0];
    console.log('Found customer:', customer.name, 'with phone:', customer.phone);

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
    const creditsList = credits || [];

    console.log('Found credits count:', creditsList.length);

    // Calculate totals - handle numeric types from Supabase
    const totalCredits = creditsList.reduce((sum, c) => {
      const amount = typeof c.total_amount === 'number' ? c.total_amount : parseFloat(c.total_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalPaid = creditsList.reduce((sum, c) => {
      const amount = typeof c.paid_amount === 'number' ? c.paid_amount : parseFloat(c.paid_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalOutstanding = creditsList.reduce((sum, c) => {
      const amount = typeof c.remaining_amount === 'number' ? c.remaining_amount : parseFloat(c.remaining_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const unpaidCount = creditsList.filter(c => c.status === 'unpaid').length;
    const partiallyPaidCount = creditsList.filter(c => c.status === 'partially-paid').length;

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
 * Format number with commas (every 3 digits)
 */
function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format all credits as structured text message
 */
function formatAllCreditsMessage(customers: any[], credits: any[]): string {
  // Group credits by customer
  const creditsByCustomer = new Map<string, any[]>();
  
  credits.forEach(credit => {
    const customerId = credit.customer_id;
    if (!creditsByCustomer.has(customerId)) {
      creditsByCustomer.set(customerId, []);
    }
    creditsByCustomer.get(customerId)!.push(credit);
  });

  // Calculate totals
  const totalCreditsAmount = credits.reduce((sum, c) => {
    const amount = typeof c.total_amount === 'number' ? c.total_amount : parseFloat(c.total_amount.toString());
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const totalPaidAmount = credits.reduce((sum, c) => {
    const amount = typeof c.paid_amount === 'number' ? c.paid_amount : parseFloat(c.paid_amount.toString());
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const totalRemainingAmount = credits.reduce((sum, c) => {
    const amount = typeof c.remaining_amount === 'number' ? c.remaining_amount : parseFloat(c.remaining_amount.toString());
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  let message = '*🗒 ጠቅላላ የብድር ታሪክ *\n\n';
  
  message += `የብድር ብዛት: ${credits.length}\n`;
  message += `ጠቅላላ የብድር መጠን: *${formatNumberWithCommas(totalCreditsAmount)} ብር*\n`;
  message += `ጠቅላላ የተከፈለ: *${formatNumberWithCommas(totalPaidAmount)} ብር*\n`;
  message += `ቀሪ የሚከፈል: *${formatNumberWithCommas(totalRemainingAmount)} ብር*\n\n`;
  message += '───────────────────\n\n';

  // Sort customers by name for consistent ordering
  const sortedCustomerIds = Array.from(creditsByCustomer.keys()).sort((a, b) => {
    const customerA = customers.find(c => c.id === a);
    const customerB = customers.find(c => c.id === b);
    const nameA = customerA?.name || '';
    const nameB = customerB?.name || '';
    return nameA.localeCompare(nameB);
  });

  sortedCustomerIds.forEach((customerId, index) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const customerCredits = creditsByCustomer.get(customerId)!;
    
    // Calculate customer totals
    const customerTotal = customerCredits.reduce((sum, c) => {
      const amount = typeof c.total_amount === 'number' ? c.total_amount : parseFloat(c.total_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const customerPaid = customerCredits.reduce((sum, c) => {
      const amount = typeof c.paid_amount === 'number' ? c.paid_amount : parseFloat(c.paid_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const customerRemaining = customerCredits.reduce((sum, c) => {
      const amount = typeof c.remaining_amount === 'number' ? c.remaining_amount : parseFloat(c.remaining_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Customer header
    message += `👤 *${customer.name}*\n\n`;
    message += `**ስልክ ቁጥር**: ${customer.phone}\n`;
    message += `**የብድር ብዛት**: ${customerCredits.length} | **ጠቅላላ የብድር መጠን**: ${formatNumberWithCommas(customerTotal)} ብር | **የተከፈለ**: ${formatNumberWithCommas(customerPaid)} ብር | **ቀሪ**: ${formatNumberWithCommas(customerRemaining)} ብር\n\n`;

    // List credits for this customer
    customerCredits.forEach((credit, creditIndex) => {
      const item = credit.item || '-';
      const total = typeof credit.total_amount === 'number' ? credit.total_amount : parseFloat(credit.total_amount.toString());
    
      const status = credit.status === 'paid' ? '**ተከፍሏል ✅**' : credit.status === 'partially-paid' ? '**በከፊል ተከፍሏል 🔵**' : '**አልተከፈለም ❌**';
      const date = credit.date ? new Date(credit.date).toLocaleDateString() : '-';

      message += `${creditIndex + 1}. ${item}\n`;
      message += `   ቀን: ${date} | የወሰደው የየብድር መጠን: ${formatNumberWithCommas(total)} ብር\n`;
      message += `   የብድሩ ሁኔታ: ${status}\n`;
      
      if (credit.remarks) {
        message += `   ማስታወሻ: ${credit.remarks}\n`;
      }
      
      message += '\n';
    });

    // Separator line between customers (except last one)
    if (index < sortedCustomerIds.length - 1) {
      message += '───────────────────\n\n';
    }
  });

  return message;
}

/**
 * Format credit info message
 */
function formatCreditMessage(info: CustomerCreditInfo): string {
  const { customerName, totalCredits, totalPaid, totalOutstanding, unpaidCount, partiallyPaidCount } = info;

  
  let message = `👤 *ደንበኛ:* ${customerName}\n\n`;
  message += ` *ጠቅላላ የብድር መጠን:* ${formatNumberWithCommas(totalCredits)} ብር\n`;
  message += ` *እስካሁን የተከፈለ:* ${formatNumberWithCommas(totalPaid)} ብር\n`;
  message += ` *ቀሪ:* ${formatNumberWithCommas(totalOutstanding)} ብር\n\n`;

  if (unpaidCount > 0 || partiallyPaidCount > 0) {
    if (unpaidCount > 0) {
      message += `📋 *Summary:*\n`;
      message += `• ያልተከፈለ የብድር ብዛት: ${unpaidCount.toLocaleString('en-US')}\n`;
    }
  } else {
    message += `✅ ሁሉም እዳዎች ተከፍለዋል!`;
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
 * Get all credits for a user
 */
async function getAllCreditsForUser(userId: string) {
  if (!supabase) {
    return null;
  }

  try {
    // Get all customers for this user
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('user_id', userId);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return null;
    }

    if (!customers || customers.length === 0) {
      return { customers: [], credits: [] };
    }

    // Get all credits for all customers
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('id, customer_id, item, total_amount, paid_amount, remaining_amount, status, date, remarks')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return null;
    }

    return {
      customers: customers || [],
      credits: credits || [],
    };
  } catch (error) {
    console.error('Error getting all credits:', error);
    return null;
  }
}

/**
 * Generate PDF for all credits
 */
async function generateAllCreditsPDF(customers: any[], credits: any[]): Promise<Buffer | null> {
  try {
    // Dynamically import jsPDF
    let jsPDF: any;
    try {
      jsPDF = (await import('jspdf')).default;
    } catch (importError: any) {
      console.error('Error importing jsPDF:', importError);
      console.error('Import error stack:', importError?.stack);
      return null;
    }
    
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    const lineHeight = 7;
    const maxY = pageHeight - margin;

    // Helper function to add a new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > maxY) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    function formatNumber(num: number): string {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('All Credits Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Export date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const totalCreditsAmount = credits.reduce((sum, c) => {
      const amount = typeof c.total_amount === 'number' ? c.total_amount : parseFloat(c.total_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalPaidAmount = credits.reduce((sum, c) => {
      const amount = typeof c.paid_amount === 'number' ? c.paid_amount : parseFloat(c.paid_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalRemainingAmount = credits.reduce((sum, c) => {
      const amount = typeof c.remaining_amount === 'number' ? c.remaining_amount : parseFloat(c.remaining_amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    doc.text(`Total Credits: ${credits.length}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Amount: ${formatNumber(totalCreditsAmount)} ETB`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Paid: ${formatNumber(totalPaidAmount)} ETB`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Remaining: ${formatNumber(totalRemainingAmount)} ETB`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Table header
    checkNewPage(lineHeight * 2);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Credits Details', margin, yPosition);
    yPosition += lineHeight * 1.5;

    // Table columns
    const colWidths = [35, 30, 35, 25, 25, 25, 20];
    const headers = ['Customer', 'Phone', 'Item', 'Total', 'Paid', 'Remaining', 'Status'];
    let xPosition = margin;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += lineHeight;

    // Draw line under header
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight * 0.5;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    credits.forEach((credit, index) => {
      checkNewPage(lineHeight * 2);

      const customer = customers.find(c => c.id === credit.customer_id);
      const customerName = customer?.name || 'Unknown';
      const phone = customer?.phone || '-';
      const item = credit.item && credit.item.length > 20 ? credit.item.substring(0, 20) + '...' : (credit.item || '-');
      const total = formatNumber(typeof credit.total_amount === 'number' ? credit.total_amount : parseFloat(credit.total_amount.toString()));
      const paid = formatNumber(typeof credit.paid_amount === 'number' ? credit.paid_amount : parseFloat(credit.paid_amount.toString()));
      const remaining = formatNumber(typeof credit.remaining_amount === 'number' ? credit.remaining_amount : parseFloat(credit.remaining_amount.toString()));
      const status = credit.status === 'paid' ? 'Paid' : credit.status === 'partially-paid' ? 'Partial' : 'Unpaid';

      xPosition = margin;
      const rowData = [customerName, phone, item, total, paid, remaining, status];

      rowData.forEach((data, colIndex) => {
        // Truncate text if too long
        let text = String(data);
        if (colIndex === 0 && text.length > 15) text = text.substring(0, 15) + '...';
        if (colIndex === 2 && text.length > 20) text = text.substring(0, 20) + '...';

        doc.text(text, xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });

      yPosition += lineHeight;

      // Add separator line every 5 rows
      if ((index + 1) % 5 === 0 && index < credits.length - 1) {
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight * 0.5;
      }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Generate PDF as buffer
    let pdfArrayBuffer: ArrayBuffer;
    try {
      pdfArrayBuffer = doc.output('arraybuffer');
    } catch (outputError: any) {
      console.error('Error outputting PDF:', outputError);
      console.error('Output error stack:', outputError?.stack);
      return null;
    }
    
    return Buffer.from(pdfArrayBuffer);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    console.error('PDF generation error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return null;
  }
}

/**
 * Send PDF document to Telegram
 */
async function sendTelegramDocument(chatId: number, pdfBuffer: Buffer, fileName: string, caption?: string) {
  const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/sendDocument`;
  
  try {
    // Construct multipart/form-data manually
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const parts: Buffer[] = [];
    
    // Add chat_id
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="chat_id"\r\n\r\n`));
    parts.push(Buffer.from(chatId.toString()));
    parts.push(Buffer.from(`\r\n`));
    
    // Add document
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(Buffer.from(`Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`));
    parts.push(Buffer.from(`Content-Type: application/pdf\r\n\r\n`));
    parts.push(pdfBuffer);
    parts.push(Buffer.from(`\r\n`));
    
    // Add caption if provided
    if (caption) {
      parts.push(Buffer.from(`--${boundary}\r\n`));
      parts.push(Buffer.from(`Content-Disposition: form-data; name="caption"\r\n\r\n`));
      parts.push(Buffer.from(caption));
      parts.push(Buffer.from(`\r\n`));
    }
    
    // Close boundary
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    
    const body = Buffer.concat(parts);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      },
      body: body,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error sending document:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram document:', error);
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
    const messageText = message.text?.trim() || '';

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

    // Handle /report command
    if (messageText.toLowerCase() === '/report' || messageText.toLowerCase() === '/report@' + (process.env.BOT_USERNAME || '')) {
      console.log('Handling /allcredits command for user:', userId);

      // Get all credits
      const allCreditsData = await getAllCreditsForUser(userId);
      
      if (!allCreditsData) {
        await sendTelegramMessage(
          message.chat.id,
          'Error fetching credits data. Please try again later.',
          message.message_id
        );
        return res.status(200).json({ ok: true });
      }

      if (allCreditsData.credits.length === 0) {
        await sendTelegramMessage(
          message.chat.id,
          'No credits found. Add some credits first!',
          message.message_id
        );
        return res.status(200).json({ ok: true });
      }

      // Format and send credits as text message
      const creditsMessage = formatAllCreditsMessage(allCreditsData.customers, allCreditsData.credits);
      
      await sendTelegramMessage(
        message.chat.id,
        creditsMessage,
        message.message_id
      );

      return res.status(200).json({ ok: true });
    }

    // Extract phone number from message
    const phoneNumber = extractPhoneNumber(messageText);

    if (!phoneNumber) {
      await sendTelegramMessage(
        message.chat.id,
        'Please send a valid phone number.\n\nExample: +251912345678 or 0912345678\n\nOr use /report to get all credits',
        message.message_id
      );
      return res.status(200).json({ ok: true });
    }

    console.log('Extracted phone number:', phoneNumber);
    console.log('User ID:', userId);

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
    
    // Create inline button to open mini app with customer details
    // Using web_app type ensures it opens in Telegram Mini App context (not browser)
    const miniAppUrl = `${MINI_APP_URL}?customerId=${creditInfo.customerId}`;
    const inlineKeyboard = [
      [
        {
          text: '📱 View Customer Details',
          web_app: {
            url: miniAppUrl,
          },
        },
      ],
    ];
    
    console.log('Mini app URL for customer details:', miniAppUrl);

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

