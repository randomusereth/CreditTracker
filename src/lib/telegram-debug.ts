/**
 * TELEGRAM MINI APP DEBUGGING UTILITIES
 * Helper functions for debugging when running inside Telegram
 */

/**
 * Check if running inside Telegram Mini App
 */
export function isTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Telegram WebApp API
  return !!(window as any).Telegram?.WebApp || !!(window as any).TelegramWebApp;
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): any {
  if (typeof window === 'undefined') return null;
  
  // Telegram WebApp is available via window.Telegram.WebApp
  return (window as any).Telegram?.WebApp || null;
}

/**
 * Enhanced console logging for Telegram
 * Logs to both console and shows alert in Telegram
 */
export function debugLog(message: string, data?: any): void {
  const logMsg = `[DEBUG] ${message}`;
  console.log(logMsg, data || '');
  
  // In Telegram, you can also show alerts (useful for debugging)
  const tg = getTelegramWebApp();
  if (tg && (tg as any).showAlert) {
    try {
      const alertMsg = data 
        ? `${message}\n\n${JSON.stringify(data, null, 2).substring(0, 200)}`
        : message;
      (tg as any).showAlert(alertMsg);
    } catch (e) {
      // Alert might not be available
    }
  }
}

/**
 * Show error in Telegram
 */
export function debugError(error: Error | string, context?: string): void {
  const errorMsg = error instanceof Error ? error.message : error;
  const fullMsg = context ? `[${context}] ${errorMsg}` : errorMsg;
  
  console.error(fullMsg, error);
  
  const tg = getTelegramWebApp();
  if (tg && (tg as any).showAlert) {
    try {
      (tg as any).showAlert(`Error: ${fullMsg}`);
    } catch (e) {
      // Alert might not be available
    }
  }
}

/**
 * Get Telegram user info (if available)
 */
export function getTelegramUser(): any {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  
  const tgAny = tg as any;
  
  // Try initDataUnsafe first (most common)
  if (tgAny.initDataUnsafe?.user) {
    return tgAny.initDataUnsafe.user;
  }
  
  // Fallback to other possible locations
  if (tgAny.initData?.user) {
    return tgAny.initData.user;
  }
  
  // Debug: log what's available
  if (tgAny.initDataUnsafe) {
    console.log('[DEBUG] initDataUnsafe available:', Object.keys(tgAny.initDataUnsafe));
  }
  
  return null;
}

/**
 * Log complete Telegram initData structure
 * Shows all data Telegram sends when Mini App loads
 */
export function logTelegramInitData(): void {
  const tg = getTelegramWebApp();
  if (!tg) {
    console.log('[TELEGRAM INIT DATA] Not running in Telegram Mini App');
    return;
  }

  const tgAny = tg as any;
  
  console.group('📦 Telegram initData Structure');
  
  // Raw initData string (URL-encoded)
  if (tgAny.initData) {
    console.log('Raw initData (string):', tgAny.initData);
  }
  
  // Parsed initDataUnsafe (easier to use)
  if (tgAny.initDataUnsafe) {
    console.log('Parsed initDataUnsafe (object):', tgAny.initDataUnsafe);
    
    // User object structure
    if (tgAny.initDataUnsafe.user) {
      console.group('👤 User Object:');
      console.log('Full user object:', tgAny.initDataUnsafe.user);
      console.log('User ID:', tgAny.initDataUnsafe.user.id);
      console.log('First Name:', tgAny.initDataUnsafe.user.first_name);
      console.log('Last Name:', tgAny.initDataUnsafe.user.last_name);
      console.log('Username:', tgAny.initDataUnsafe.user.username);
      console.log('Language Code:', tgAny.initDataUnsafe.user.language_code);
      console.log('Is Premium:', tgAny.initDataUnsafe.user.is_premium);
      console.log('Photo URL:', tgAny.initDataUnsafe.user.photo_url);
      console.log('Allows Write to PM:', tgAny.initDataUnsafe.user.allows_write_to_pm);
      console.groupEnd();
    }
    
    // Chat object (if opened from a chat)
    if (tgAny.initDataUnsafe.chat) {
      console.group('💬 Chat Object:');
      console.log('Chat ID:', tgAny.initDataUnsafe.chat.id);
      console.log('Chat Type:', tgAny.initDataUnsafe.chat.type);
      console.log('Chat Title:', tgAny.initDataUnsafe.chat.title);
      console.log('Chat Username:', tgAny.initDataUnsafe.chat.username);
      console.log('Chat Photo URL:', tgAny.initDataUnsafe.chat.photo?.url);
      console.groupEnd();
    }
    
    // Chat type (if opened from a chat)
    if (tgAny.initDataUnsafe.chat_type) {
      console.log('Chat Type:', tgAny.initDataUnsafe.chat_type);
    }
    
    // Chat instance (for group chats)
    if (tgAny.initDataUnsafe.chat_instance) {
      console.log('Chat Instance:', tgAny.initDataUnsafe.chat_instance);
    }
    
    // Start parameter (if opened with /start parameter)
    if (tgAny.initDataUnsafe.start_param) {
      console.log('Start Parameter:', tgAny.initDataUnsafe.start_param);
    }
    
    // Auth date
    if (tgAny.initDataUnsafe.auth_date) {
      console.log('Auth Date (Unix timestamp):', tgAny.initDataUnsafe.auth_date);
      console.log('Auth Date (readable):', new Date(tgAny.initDataUnsafe.auth_date * 1000).toISOString());
    }
    
    // Hash (for verification)
    if (tgAny.initDataUnsafe.hash) {
      console.log('Hash (for verification):', tgAny.initDataUnsafe.hash);
    }
    
    // Query ID (for bot queries)
    if (tgAny.initDataUnsafe.query_id) {
      console.log('Query ID:', tgAny.initDataUnsafe.query_id);
    }
    
    // Receiver (if opened from a channel)
    if (tgAny.initDataUnsafe.receiver) {
      console.log('Receiver:', tgAny.initDataUnsafe.receiver);
    }
  }
  
  console.groupEnd();
}

/**
 * Log current app state for debugging
 */
export function logAppState(state: any): void {
  console.log('[APP STATE]', state);
  
  // In Telegram, you can also send to bot
  const tg = getTelegramWebApp();
  if (tg && (tg as any).sendData) {
    try {
      (tg as any).sendData(JSON.stringify({ type: 'debug', state }));
    } catch (e) {
      console.warn('Could not send data to bot:', e);
    }
  }
}

/**
 * Check Telegram WebApp version and capabilities
 */
export function logTelegramInfo(): void {
  const tg = getTelegramWebApp();
  if (!tg) {
    console.log('[TELEGRAM] Not running in Telegram Mini App');
    console.warn('[TELEGRAM] ⚠️ Running in browser - Telegram features unavailable');
    console.log('[TELEGRAM] To test properly:');
    console.log('[TELEGRAM] 1. Deploy to Vercel');
    console.log('[TELEGRAM] 2. Create a Telegram bot with @BotFather');
    console.log('[TELEGRAM] 3. Set web app URL in bot settings');
    console.log('[TELEGRAM] 4. Open bot in Telegram app');
    return;
  }
  
  const tgAny = tg as any;
  const user = tgAny.initDataUnsafe?.user;
  
  console.log('[TELEGRAM INFO] ✅ Running in Telegram Mini App', {
    version: tgAny.version,
    platform: tgAny.platform,
    colorScheme: tgAny.colorScheme,
    initDataUnsafe: tgAny.initDataUnsafe ? 'Present' : 'Missing',
    user: user ? {
      id: user.id,
      firstName: user.first_name,
      username: user.username,
    } : 'Not available',
  });
}

/**
 * Show environment comparison
 */
export function showEnvironmentInfo(): void {
  const tg = getTelegramWebApp();
  const isInTelegram = !!tg;
  
  console.group('🔍 Environment Check');
  console.log('Running in Telegram:', isInTelegram ? '✅ YES' : '❌ NO (Browser)');
  
  if (isInTelegram) {
    const tgAny = tg as any;
    console.log('✅ Available features:');
    console.log('  - User data:', tgAny.initDataUnsafe?.user ? '✅' : '❌');
    console.log('  - Theme sync:', tgAny.colorScheme ? '✅' : '❌');
    console.log('  - Viewport control:', tgAny.expand ? '✅' : '❌');
    console.log('  - Back button:', tgAny.BackButton ? '✅' : '❌');
    console.log('  - Main button:', tgAny.MainButton ? '✅' : '❌');
    console.log('  - Haptic feedback:', tgAny.HapticFeedback ? '✅' : '❌');
  } else {
    console.log('❌ Unavailable features (only in Telegram):');
    console.log('  - User authentication data');
    console.log('  - Theme synchronization');
    console.log('  - Back button control');
    console.log('  - Main button control');
    console.log('  - Haptic feedback');
    console.log('  - Payment API');
    console.log('  - Cloud storage');
    console.log('');
    console.log('💡 Your app will still work, but:');
    console.log('  - Users must manually enter their info');
    console.log('  - Theme won\'t sync with Telegram');
    console.log('  - Some Telegram-specific features disabled');
  }
  console.groupEnd();
}

/**
 * Setup Telegram WebApp
 */
export function initTelegramWebApp(): void {
  try {
    const tg = getTelegramWebApp();
    if (!tg) {
      console.log('[TELEGRAM] Not in Telegram environment - running in browser');
      return;
    }
    
    // Wait for WebApp to be ready
    if (tg.ready) {
      tg.ready();
    }
    
    // Expand the app to full height
    if (tg.expand) {
      tg.expand();
    }
    
    // Enable closing confirmation
    if (tg.enableClosingConfirmation) {
      tg.enableClosingConfirmation();
    }
    
    // Set app theme based on Telegram theme
    if (tg.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for theme changes
    if (tg.onEvent) {
      tg.onEvent('themeChanged', () => {
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    }
    
    console.log('[TELEGRAM] WebApp initialized');
    logTelegramInfo();
  } catch (error) {
    console.warn('[TELEGRAM] Failed to initialize:', error);
  }
}

