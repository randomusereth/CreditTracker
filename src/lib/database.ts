/**
 * DATABASE LAYER
 * This module exports database functions that use Supabase.
 * Falls back to localStorage if Supabase is not configured.
 */

import { AppState } from '../types';
import { getUserData as getSupabaseUserData, saveUserData as saveSupabaseUserData, clearUserData as clearSupabaseUserData } from './supabase';

/**
 * DATABASE HELPER FUNCTIONS
 * These functions use Supabase when available, otherwise fall back to localStorage
 */

// Get user-specific data from storage
export async function getUserData(userId: string): Promise<AppState> {
  try {
    // Try Supabase first
    return await getSupabaseUserData(userId);
  } catch (error) {
    console.warn('Supabase unavailable, falling back to localStorage:', error);
    // Fallback to localStorage
    if (typeof window === 'undefined') {
      return getEmptyAppState();
    }

    const key = `creditTrackerData_user_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getEmptyAppState();
      }
    }

    return getEmptyAppState();
  }
}

// Save user-specific data to storage
export async function saveUserData(userId: string, data: AppState): Promise<void> {
  try {
    // Try Supabase first
    await saveSupabaseUserData(userId, data);
  } catch (error) {
    console.warn('Supabase unavailable, falling back to localStorage:', error);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const key = `creditTrackerData_user_${userId}`;
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
}

// Clear user-specific data
export async function clearUserData(userId: string): Promise<void> {
  try {
    // Try Supabase first
    await clearSupabaseUserData(userId);
  } catch (error) {
    console.warn('Supabase unavailable, falling back to localStorage:', error);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const key = `creditTrackerData_user_${userId}`;
      localStorage.removeItem(key);
    }
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

// Legacy functions for backwards compatibility (kept for reference)
export function getAllData(): AppState {
  // This now returns empty data - users must be authenticated
  return getEmptyAppState();
}

export function saveAllData(data: AppState): void {
  // Legacy - no-op
  console.warn('saveAllData called without user context');
}

export function clearAllData(): void {
  // Legacy - no-op
  console.warn('clearAllData called without user context');
}