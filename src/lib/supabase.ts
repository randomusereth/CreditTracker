/**
 * SUPABASE CLIENT CONFIGURATION
 * Creates and exports Supabase client instances for client and server usage
 */

import { createClient } from '@supabase/supabase-js';
import { AppState, Customer, Credit, ShopInfo, Staff, AppSettings } from '@/types';

// Supabase configuration
// Vite uses import.meta.env instead of process.env
// Environment variables must be prefixed with VITE_ in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Using localStorage fallback.');
  console.warn('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
  console.warn('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
}

// Create Supabase client for client-side usage
// Only create if we have valid credentials
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Database table names
export const TABLES = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  CREDITS: 'credits',
  PAYMENT_RECORDS: 'payment_records',
  SHOP_INFO: 'shop_info',
  STAFF: 'staff',
  SETTINGS: 'settings',
} as const;

/**
 * Database helper functions using Supabase
 */

// Ensure user exists in database
export async function ensureUserExists(userId: string, telegramId?: string, passwordHash?: string): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey) return;

  try {
    const { error } = await supabase
      .from(TABLES.USERS)
      .upsert({
        id: userId,
        telegram_id: telegramId || null,
        password_hash: passwordHash || null,
      }, {
        onConflict: 'id',
      });
    
    if (error) {
      console.warn('Error ensuring user exists:', error);
    }
  } catch (error) {
    console.warn('Error ensuring user exists:', error);
  }
}

export async function getUserByTelegramId(telegramId: string): Promise<{ id: string; password_hash: string } | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('id, password_hash')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    // maybeSingle returns null if no row found, which is fine
    if (error) {
      // Only log if it's not a "not found" error
      if (error.code !== 'PGRST116') {
        console.warn('Error getting user by telegram ID:', error);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error getting user by telegram ID:', error);
    return null;
  }
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey) return;

  try {
    const { error } = await supabase
      .from(TABLES.USERS)
      .update({ password_hash: passwordHash })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn('Error updating user password:', error);
    throw error;
  }
}

// Get user-specific app state
export async function getUserData(userId: string): Promise<AppState> {
  // If Supabase is not configured, fall back to localStorage
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`creditTrackerData_user_${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return getEmptyAppState();
        }
      }
    }
    return getEmptyAppState();
  }

  try {
    // Fetch all user data in parallel
    const [customersResult, creditsResult, shopInfoResult, staffResult, settingsResult] = await Promise.all([
      supabase.from(TABLES.CUSTOMERS).select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from(TABLES.CREDITS).select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from(TABLES.SHOP_INFO).select('*').eq('user_id', userId).maybeSingle(),
      supabase.from(TABLES.STAFF).select('*').eq('user_id', userId).order('name', { ascending: true }),
      supabase.from(TABLES.SETTINGS).select('*').eq('user_id', userId).maybeSingle(),
    ]);

    // Handle errors
    if (customersResult.error) throw customersResult.error;
    if (creditsResult.error) throw creditsResult.error;
    if (shopInfoResult.error) throw shopInfoResult.error;
    if (staffResult.error) throw staffResult.error;
    if (settingsResult.error) throw settingsResult.error;

    // Fetch payment history for all credits
    const creditIds = creditsResult.data?.map(c => c.id) || [];
    let paymentRecords: any[] = [];
    
    if (creditIds.length > 0) {
      const paymentsResult = await supabase
        .from(TABLES.PAYMENT_RECORDS)
        .select('*')
        .eq('user_id', userId)
        .in('credit_id', creditIds)
        .order('date', { ascending: true });
      
      if (paymentsResult.error) throw paymentsResult.error;
      paymentRecords = paymentsResult.data || [];
    }

    // Transform credits with payment history
    const credits: Credit[] = (creditsResult.data || []).map(credit => ({
      id: credit.id,
      customerId: credit.customer_id,
      item: credit.item,
      remarks: credit.remarks || '',
      totalAmount: credit.total_amount,
      paidAmount: credit.paid_amount,
      remainingAmount: credit.remaining_amount,
      images: credit.images || [],
      date: credit.date,
      status: credit.status,
      paymentHistory: paymentRecords
        .filter(p => p.credit_id === credit.id)
        .map(p => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          remainingAfterPayment: p.remaining_after_payment,
          note: p.note || undefined,
        })),
    }));

    // Transform customers
    const customers: Customer[] = (customersResult.data || []).map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      createdAt: c.created_at,
    }));

    // Transform shop info
    const shopInfo: ShopInfo | null = shopInfoResult.data ? {
      name: shopInfoResult.data.name,
      region: shopInfoResult.data.region,
      city: shopInfoResult.data.city,
      phone: shopInfoResult.data.phone,
      email: shopInfoResult.data.email || undefined,
    } : null;

    // Transform staff
    const staff: Staff[] = (staffResult.data || []).map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      permissions: {
        viewReports: s.view_reports,
        addCredit: s.add_credit,
        manageCustomers: s.manage_customers,
      },
    }));

    // Transform settings
    const settings: AppSettings = settingsResult.data ? {
      theme: settingsResult.data.theme,
      language: settingsResult.data.language,
      calendarType: settingsResult.data.calendar_type,
    } : {
      theme: 'dark',
      language: 'en',
      calendarType: 'gregorian',
    };

    return {
      customers,
      credits,
      shopInfo,
      staff,
      settings,
    };
  } catch (error: any) {
    console.error('Error fetching user data from Supabase:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    throw error; // Re-throw so database.ts can catch it and fallback
  }
}

// Save user-specific app state
export async function saveUserData(userId: string, data: AppState): Promise<void> {
  // If Supabase is not configured, fall back to localStorage
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`creditTrackerData_user_${userId}`, JSON.stringify(data));
    }
    return;
  }

  try {
    // Save customers
    if (data.customers.length > 0) {
      const customersToInsert = data.customers.map(c => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        phone: c.phone,
        created_at: c.createdAt,
      }));

      // Delete existing and insert new
      await supabase.from(TABLES.CUSTOMERS).delete().eq('user_id', userId);
      if (customersToInsert.length > 0) {
        const { error } = await supabase.from(TABLES.CUSTOMERS).insert(customersToInsert);
        if (error) throw error;
      }
    } else {
      await supabase.from(TABLES.CUSTOMERS).delete().eq('user_id', userId);
    }

    // Save credits and payment records
    if (data.credits.length > 0) {
      // Delete existing payment records and credits
      const existingCredits = await supabase.from(TABLES.CREDITS).select('id').eq('user_id', userId);
      if (existingCredits.data && existingCredits.data.length > 0) {
        const creditIds = existingCredits.data.map(c => c.id);
        await supabase.from(TABLES.PAYMENT_RECORDS).delete().in('credit_id', creditIds);
      }
      await supabase.from(TABLES.CREDITS).delete().eq('user_id', userId);

      // Insert credits
      const creditsToInsert = data.credits.map(c => ({
        id: c.id,
        user_id: userId,
        customer_id: c.customerId,
        item: c.item,
        remarks: c.remarks,
        total_amount: c.totalAmount,
        paid_amount: c.paidAmount,
        remaining_amount: c.remainingAmount,
        images: c.images,
        date: c.date,
        status: c.status,
      }));

      const { error: creditsError } = await supabase.from(TABLES.CREDITS).insert(creditsToInsert);
      if (creditsError) throw creditsError;

      // Insert payment records
      const paymentRecordsToInsert: any[] = [];
      data.credits.forEach(credit => {
        credit.paymentHistory.forEach(payment => {
          paymentRecordsToInsert.push({
            id: payment.id,
            credit_id: credit.id,
            user_id: userId,
            amount: payment.amount,
            date: payment.date,
            remaining_after_payment: payment.remainingAfterPayment,
            note: payment.note || null,
          });
        });
      });

      if (paymentRecordsToInsert.length > 0) {
        const { error: paymentsError } = await supabase.from(TABLES.PAYMENT_RECORDS).insert(paymentRecordsToInsert);
        if (paymentsError) throw paymentsError;
      }
    } else {
      await supabase.from(TABLES.CREDITS).delete().eq('user_id', userId);
    }

    // Save shop info
    if (data.shopInfo) {
      const { error } = await supabase
        .from(TABLES.SHOP_INFO)
        .upsert({
          user_id: userId,
          name: data.shopInfo.name,
          region: data.shopInfo.region,
          city: data.shopInfo.city,
          phone: data.shopInfo.phone,
          email: data.shopInfo.email || null,
        }, {
          onConflict: 'user_id',
        });
      if (error) throw error;
    } else {
      await supabase.from(TABLES.SHOP_INFO).delete().eq('user_id', userId);
    }

    // Save staff
    if (data.staff.length > 0) {
      const staffToInsert = data.staff.map(s => ({
        id: s.id,
        user_id: userId,
        name: s.name,
        role: s.role,
        view_reports: s.permissions.viewReports,
        add_credit: s.permissions.addCredit,
        manage_customers: s.permissions.manageCustomers,
      }));

      await supabase.from(TABLES.STAFF).delete().eq('user_id', userId);
      const { error } = await supabase.from(TABLES.STAFF).insert(staffToInsert);
      if (error) throw error;
    } else {
      await supabase.from(TABLES.STAFF).delete().eq('user_id', userId);
    }

    // Save settings
    const { error } = await supabase
      .from(TABLES.SETTINGS)
      .upsert({
        user_id: userId,
        theme: data.settings.theme,
        language: data.settings.language,
        calendar_type: data.settings.calendarType,
      }, {
        onConflict: 'user_id',
      });
    if (error) throw error;
  } catch (error) {
    console.error('Error saving user data to Supabase:', error);
    throw error;
  }
}

// Clear user-specific data
export async function clearUserData(userId: string): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`creditTrackerData_user_${userId}`);
    }
    return;
  }

  try {
    // Delete all user data
    await Promise.all([
      supabase.from(TABLES.CUSTOMERS).delete().eq('user_id', userId),
      supabase.from(TABLES.CREDITS).delete().eq('user_id', userId),
      supabase.from(TABLES.SHOP_INFO).delete().eq('user_id', userId),
      supabase.from(TABLES.STAFF).delete().eq('user_id', userId),
      supabase.from(TABLES.SETTINGS).delete().eq('user_id', userId),
    ]);

    // Delete payment records for user's credits
    const creditsResult = await supabase.from(TABLES.CREDITS).select('id').eq('user_id', userId);
    if (creditsResult.data && creditsResult.data.length > 0) {
      const creditIds = creditsResult.data.map(c => c.id);
      await supabase.from(TABLES.PAYMENT_RECORDS).delete().in('credit_id', creditIds);
    }
  } catch (error) {
    console.error('Error clearing user data from Supabase:', error);
    throw error;
  }
}

// Default empty state
function getEmptyAppState(): AppState {
  return {
    customers: [],
    credits: [],
    shopInfo: null,
    staff: [],
    settings: {
      theme: 'dark',
      language: 'en',
      calendarType: 'gregorian',
    },
  };
}

