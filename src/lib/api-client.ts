/**
 * API CLIENT FOR NEXT.JS
 * Client-side functions to call Next.js API routes
 * Now supports per-user data storage
 */

import { AppState, Customer, Credit, ShopInfo, Staff, AppSettings } from '@/types';

const API_BASE = '/api';

/**
 * Fetch user-specific app data
 */
export async function fetchUserData(userId: string): Promise<AppState> {
  const response = await fetch(`${API_BASE}/data?userId=${userId}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return response.json();
}

/**
 * Save user-specific app data
 */
export async function saveUserData(userId: string, data: AppState): Promise<void> {
  const response = await fetch(`${API_BASE}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, data }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save data');
  }
}

/**
 * Clear user-specific data
 */
export async function clearUserData(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/data?userId=${userId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to clear data');
  }
}

// Legacy functions (deprecated)
export async function fetchAllData(): Promise<AppState> {
  console.warn('fetchAllData is deprecated, use fetchUserData instead');
  return {
    customers: [],
    credits: [],
    shopInfo: null,
    staff: [],
    settings: { theme: 'dark', language: 'en', calendarType: 'gregorian' },
  };
}

export async function saveAllData(data: AppState): Promise<void> {
  console.warn('saveAllData is deprecated, use saveUserData instead');
}

export async function clearAllData(): Promise<void> {
  console.warn('clearAllData is deprecated, use clearUserData instead');
}