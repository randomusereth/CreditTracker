/**
 * TEST ENDPOINT - Check if environment variables are set correctly
 * 
 * Endpoint: /api/telegram/test
 * Method: GET
 * 
 * Use this to verify your environment variables are configured correctly
 */

export default async function handler(req: any, res: any) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envCheck = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing',
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    MINI_APP_URL: process.env.MINI_APP_URL ? '✅ Set' : '❌ Missing',
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
  };

  // Show partial values for verification (not full secrets)
  const partialValues = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN 
      ? `${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...` 
      : 'Not set',
    SUPABASE_URL: process.env.SUPABASE_URL 
      ? process.env.SUPABASE_URL.substring(0, 30) + '...' 
      : 'Not set',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY 
      ? `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` 
      : 'Not set',
    MINI_APP_URL: process.env.MINI_APP_URL || 'Not set',
  };

  return res.status(200).json({
    message: 'Environment Variables Check',
    status: envCheck,
    partialValues: partialValues,
    allSet: Object.values(envCheck).every(v => v.includes('✅')),
  });
}




