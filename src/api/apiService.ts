import { Customer, Credit, ShopInfo, Staff, AppSettings, AppState } from '../App';
import { customersData, creditsData, shopInfoData, staffData, settingsData } from './database';

/**
 * API SERVICE
 * This simulates API calls to a server with async operations.
 * All functions return Promises to mimic real server requests.
 * 
 * HOW TO USE:
 * 1. Import the function you need: import { fetchCustomers } from './api/apiService'
 * 2. Use async/await or .then() to handle the response
 * 
 * EXAMPLE:
 * const customers = await fetchCustomers();
 * 
 * TO REPLACE WITH REAL API:
 * Simply update the functions below to call your actual backend API endpoints
 * instead of returning local data.
 */

// Simulated network delay (in milliseconds)
const NETWORK_DELAY = 300;

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// FETCH DATA (GET requests)
// ============================================

/**
 * Fetch all app data from the database
 * @returns Promise with complete app state
 */
export async function fetchAllData(): Promise<AppState> {
  await delay(NETWORK_DELAY);
  
  // Get data from localStorage if exists, otherwise use default data
  const storedData = localStorage.getItem('creditTrackerData');
  
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Return default data if nothing in localStorage
  return {
    customers: customersData,
    credits: creditsData,
    shopInfo: shopInfoData,
    staff: staffData,
    settings: settingsData,
  };
}

/**
 * Fetch all customers
 * @returns Promise with array of customers
 */
export async function fetchCustomers(): Promise<Customer[]> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return data.customers;
}

/**
 * Fetch a single customer by ID
 * @param id - Customer ID
 * @returns Promise with customer or null
 */
export async function fetchCustomerById(id: string): Promise<Customer | null> {
  await delay(NETWORK_DELAY);
  const customers = await fetchCustomers();
  return customers.find(c => c.id === id) || null;
}

/**
 * Fetch all credits
 * @returns Promise with array of credits
 */
export async function fetchCredits(): Promise<Credit[]> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return data.credits;
}

/**
 * Fetch credits for a specific customer
 * @param customerId - Customer ID
 * @returns Promise with array of credits
 */
export async function fetchCreditsByCustomerId(customerId: string): Promise<Credit[]> {
  await delay(NETWORK_DELAY);
  const credits = await fetchCredits();
  return credits.filter(c => c.customerId === customerId);
}

/**
 * Fetch shop information
 * @returns Promise with shop info or null
 */
export async function fetchShopInfo(): Promise<ShopInfo | null> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return data.shopInfo;
}

/**
 * Fetch all staff members
 * @returns Promise with array of staff
 */
export async function fetchStaff(): Promise<Staff[]> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return data.staff;
}

/**
 * Fetch app settings
 * @returns Promise with settings
 */
export async function fetchSettings(): Promise<AppSettings> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return data.settings;
}

// ============================================
// SAVE DATA (POST/PUT requests)
// ============================================

/**
 * Save complete app state to the database
 * @param state - Complete app state
 */
export async function saveAllData(state: AppState): Promise<void> {
  await delay(NETWORK_DELAY);
  localStorage.setItem('creditTrackerData', JSON.stringify(state));
}

/**
 * Create a new customer
 * @param customer - Customer data
 * @returns Promise with created customer
 */
export async function createCustomer(customer: Customer): Promise<Customer> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.customers.push(customer);
  await saveAllData(data);
  return customer;
}

/**
 * Update an existing customer
 * @param customer - Updated customer data
 * @returns Promise with updated customer
 */
export async function updateCustomer(customer: Customer): Promise<Customer> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  const index = data.customers.findIndex(c => c.id === customer.id);
  if (index !== -1) {
    data.customers[index] = customer;
    await saveAllData(data);
  }
  return customer;
}

/**
 * Create a new credit
 * @param credit - Credit data
 * @returns Promise with created credit
 */
export async function createCredit(credit: Credit): Promise<Credit> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.credits.push(credit);
  await saveAllData(data);
  return credit;
}

/**
 * Update an existing credit
 * @param credit - Updated credit data
 * @returns Promise with updated credit
 */
export async function updateCredit(credit: Credit): Promise<Credit> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  const index = data.credits.findIndex(c => c.id === credit.id);
  if (index !== -1) {
    data.credits[index] = credit;
    await saveAllData(data);
  }
  return credit;
}

/**
 * Update shop information
 * @param shopInfo - Shop information
 * @returns Promise with updated shop info
 */
export async function updateShopInfo(shopInfo: ShopInfo): Promise<ShopInfo> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.shopInfo = shopInfo;
  await saveAllData(data);
  return shopInfo;
}

/**
 * Create a new staff member
 * @param staff - Staff data
 * @returns Promise with created staff
 */
export async function createStaff(staff: Staff): Promise<Staff> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.staff.push(staff);
  await saveAllData(data);
  return staff;
}

/**
 * Update an existing staff member
 * @param staff - Updated staff data
 * @returns Promise with updated staff
 */
export async function updateStaff(staff: Staff): Promise<Staff> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  const index = data.staff.findIndex(s => s.id === staff.id);
  if (index !== -1) {
    data.staff[index] = staff;
    await saveAllData(data);
  }
  return staff;
}

/**
 * Update app settings
 * @param settings - Settings data
 * @returns Promise with updated settings
 */
export async function updateSettings(settings: AppSettings): Promise<AppSettings> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.settings = settings;
  await saveAllData(data);
  return settings;
}

// ============================================
// DELETE DATA (DELETE requests)
// ============================================

/**
 * Delete a customer and all their credits
 * @param customerId - Customer ID
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.customers = data.customers.filter(c => c.id !== customerId);
  data.credits = data.credits.filter(c => c.customerId !== customerId);
  await saveAllData(data);
}

/**
 * Delete a credit
 * @param creditId - Credit ID
 */
export async function deleteCredit(creditId: string): Promise<void> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.credits = data.credits.filter(c => c.id !== creditId);
  await saveAllData(data);
}

/**
 * Delete a staff member
 * @param staffId - Staff ID
 */
export async function deleteStaff(staffId: string): Promise<void> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.staff = data.staff.filter(s => s.id !== staffId);
  await saveAllData(data);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all data (reset to defaults)
 */
export async function clearAllData(): Promise<void> {
  await delay(NETWORK_DELAY);
  localStorage.removeItem('creditTrackerData');
}

/**
 * Export data as JSON
 * @returns Promise with JSON string
 */
export async function exportDataAsJSON(): Promise<string> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON
 * @param jsonString - JSON string to import
 */
export async function importDataFromJSON(jsonString: string): Promise<void> {
  await delay(NETWORK_DELAY);
  const data = JSON.parse(jsonString);
  await saveAllData(data);
}
