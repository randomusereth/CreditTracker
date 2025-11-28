/**
 * API ENDPOINT TO TRIGGER PDF GENERATION AND SEND VIA BOT
 * 
 * Endpoint: /api/credits/send-pdf
 * Method: POST
 * 
 * This endpoint generates a PDF of all credits and sends it via Telegram bot
 */

import { createClient } from '@supabase/supabase-js';

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, telegramUserId } = req.body;

    if (!userId || !telegramUserId) {
      return res.status(400).json({ error: 'userId and telegramUserId are required' });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Get all credits
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, phone')
      .eq('user_id', userId);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }

    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('id, customer_id, item, total_amount, paid_amount, remaining_amount, status, date, remarks')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return res.status(500).json({ error: 'Failed to fetch credits' });
    }

    if (!credits || credits.length === 0) {
      return res.status(200).json({ 
        success: false,
        message: 'No credits found' 
      });
    }

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    const lineHeight = 7;
    const maxY = pageHeight - margin;

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

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight * 0.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    credits.forEach((credit, index) => {
      checkNewPage(lineHeight * 2);

      const customer = customers?.find(c => c.id === credit.customer_id);
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
        let text = String(data);
        if (colIndex === 0 && text.length > 15) text = text.substring(0, 15) + '...';
        if (colIndex === 2 && text.length > 20) text = text.substring(0, 20) + '...';
        doc.text(text, xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });

      yPosition += lineHeight;

      if ((index + 1) % 5 === 0 && index < credits.length - 1) {
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight * 0.5;
      }
    });

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

      const pdfArrayBuffer = doc.output('arraybuffer');
      pdfBuffer = Buffer.from(pdfArrayBuffer);
    } catch (pdfError: any) {
      console.error('Error generating PDF:', pdfError);
      console.error('PDF Error stack:', pdfError?.stack);
      return res.status(500).json({ 
        success: false,
        error: 'Error generating PDF',
        message: pdfError?.message || 'Failed to generate PDF document'
      });
    }

    // Send PDF via Telegram
    try {
      const chatId = parseInt(telegramUserId);
      const fileName = `all_credits_${new Date().toISOString().split('T')[0]}.pdf`;
      const caption = `📊 *All Credits Report*\n\nGenerated on: ${new Date().toLocaleDateString()}\n\nTotal Credits: ${credits.length}`;

      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const parts: Buffer[] = [];
      
      parts.push(Buffer.from(`--${boundary}\r\n`));
      parts.push(Buffer.from(`Content-Disposition: form-data; name="chat_id"\r\n\r\n`));
      parts.push(Buffer.from(chatId.toString()));
      parts.push(Buffer.from(`\r\n`));
      
      parts.push(Buffer.from(`--${boundary}\r\n`));
      parts.push(Buffer.from(`Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n`));
      parts.push(Buffer.from(`Content-Type: application/pdf\r\n\r\n`));
      parts.push(pdfBuffer);
      parts.push(Buffer.from(`\r\n`));
      
      parts.push(Buffer.from(`--${boundary}\r\n`));
      parts.push(Buffer.from(`Content-Disposition: form-data; name="caption"\r\n\r\n`));
      parts.push(Buffer.from(caption));
      parts.push(Buffer.from(`\r\n`));
      
      parts.push(Buffer.from(`--${boundary}--\r\n`));
      
      const body = Buffer.concat(parts);
      
      const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/sendDocument`;
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
        console.error('Error sending PDF via Telegram:', error);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to send PDF via Telegram',
          message: error
        });
      }

      return res.status(200).json({ 
        success: true,
        message: 'PDF sent successfully to your Telegram chat' 
      });
    } catch (telegramError: any) {
      console.error('Error sending PDF via Telegram:', telegramError);
      console.error('Telegram Error stack:', telegramError?.stack);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to send PDF via Telegram',
        message: telegramError?.message || 'Unknown error'
      });
    }
  } catch (error: any) {
    console.error('Error in send-pdf endpoint:', error);
    console.error('Error stack:', error?.stack);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error?.message || 'Unknown error occurred'
    });
  }
}

