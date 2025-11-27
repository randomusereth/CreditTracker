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
  
  // Try different ways to get user data
  return (tg as any).initDataUnsafe?.user 
    || (tg as any).initData?.user 
    || null;
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
    themeParams: tgAny.themeParams,
    initData: tgAny.initData ? 'Present' : 'Missing',
    user: user ? {
      id: user.id,
      firstName: user.first_name,
      username: user.username,
    } : 'Not available',
    isExpanded: tgAny.isExpanded,
    viewportHeight: tgAny.viewportHeight,
    viewportStableHeight: tgAny.viewportStableHeight,
    isReady: tgAny.isReady,
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
    showEnvironmentInfo();
  } catch (error) {
    console.warn('[TELEGRAM] Failed to initialize:', error);
  }
}

