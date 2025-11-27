/**
 * AUTHENTICATION UTILITIES
 * Handle user authentication and session management
 */

import { User } from '@/types/auth';
import { ensureUserExists } from './supabase';

const AUTH_STORAGE_KEY = 'creditTracker_currentUser';

/**
 * Get current authenticated user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save current user to localStorage
 */
export function saveCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Remove current user (logout)
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Create new user account
 */
export async function createUser(phoneNumber: string, telegramId: string): Promise<User> {
  const user: User = {
    id: Date.now().toString(),
    phoneNumber,
    telegramId,
    createdAt: new Date().toISOString(),
  };
  
  // Ensure user exists in Supabase
  await ensureUserExists(user.id, user.telegramId, user.phoneNumber);
  
  return user;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic validation: should contain only digits, +, -, (), and spaces
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const cleanedPhone = phone.trim();
  return cleanedPhone.length >= 10 && phoneRegex.test(cleanedPhone);
}

/**
 * Validate Telegram ID format
 */
export function validateTelegramId(id: string): boolean {
  // Telegram ID should be alphanumeric and 5-32 characters
  const idRegex = /^[a-zA-Z0-9_]{5,32}$/;
  return idRegex.test(id.trim());
}
