/**
 * AUTHENTICATION UTILITIES
 * Handle user authentication and session management
 */

import { User } from '@/types/auth';
import { ensureUserExists, getUserByTelegramId, updateUserPassword } from './supabase';
import { getTelegramUser } from './telegram-debug';

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
 * Get Telegram user ID from initData
 */
export function getTelegramUserId(): string | null {
  const tgUser = getTelegramUser();
  if (!tgUser || !tgUser.id) return null;
  return tgUser.id.toString();
}

/**
 * Hash password (simple hash for now - in production, use bcrypt or similar)
 */
export async function hashPassword(password: string): Promise<string> {
  // Simple hash using Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Create new user account with password
 */
export async function createUserWithPassword(telegramId: string, password: string): Promise<User> {
  const userId = telegramId; // Use Telegram ID as user ID
  const passwordHash = await hashPassword(password);
  
  const user: User = {
    id: userId,
    telegramId,
    createdAt: new Date().toISOString(),
  };
  
  // Create user in Supabase with password
  await ensureUserExists(user.id, user.telegramId, passwordHash);
  
  return user;
}

/**
 * Authenticate user with password
 */
export async function authenticateUser(telegramId: string, password: string): Promise<User | null> {
  const userData = await getUserByTelegramId(telegramId);
  if (!userData) return null;
  
  const isValid = await verifyPassword(password, userData.password_hash);
  if (!isValid) return null;
  
  const user: User = {
    id: userData.id,
    telegramId,
    createdAt: new Date().toISOString(),
  };
  
  return user;
}

/**
 * Check if user exists (has password set)
 */
export async function userExists(telegramId: string): Promise<boolean> {
  const userData = await getUserByTelegramId(telegramId);
  return userData !== null && userData.password_hash !== null;
}

/**
 * Validate PIN (4 digits only)
 */
export function validatePIN(pin: string): { valid: boolean; error?: string } {
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: 'PIN must be exactly 4 digits' };
  }
  return { valid: true };
}

/**
 * Validate password strength (kept for backward compatibility, but using PIN now)
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  return validatePIN(password);
}

/**
 * Change user password
 */
export async function changePassword(telegramId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  // Validate new password
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Verify current password
  const userData = await getUserByTelegramId(telegramId);
  if (!userData || !userData.password_hash) {
    return { success: false, error: 'User not found' };
  }

  const isValid = await verifyPassword(currentPassword, userData.password_hash);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  try {
    await updateUserPassword(userData.id, newPasswordHash);
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to update password. Please try again.' };
  }
}
