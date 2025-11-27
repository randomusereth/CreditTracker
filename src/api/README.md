# API Service Documentation

This folder contains the local database and API service for the Credit Tracker app. It's structured to mimic a real backend API, making it easy to understand and later replace with actual server calls.

## 📁 File Structure

```
/api
├── database.ts      - Contains all sample data (like a database)
├── apiService.ts    - Contains API functions (like API endpoints)
└── README.md        - This file
```

## 🗄️ Database (`database.ts`)

This file contains all the sample data that populates your app:

- **customersData** - Array of 8 sample customers
- **creditsData** - Array of 15 sample credits with payment histories
- **shopInfoData** - Shop information
- **staffData** - Array of 3 staff members
- **settingsData** - App settings (theme, language, etc.)

### How it works:
```typescript
// This is like a database table
export const customersData: Customer[] = [
  { id: '1', name: 'Abebe Kebede', phone: '+251911234567', ... },
  { id: '2', name: 'Tigist Alemayehu', phone: '+251922345678', ... },
  // ... more customers
];
```

## 🔌 API Service (`apiService.ts`)

This file contains functions that simulate API calls to a server. All functions:
- Are **async** (return Promises)
- Have a **300ms delay** to simulate network latency
- Use **localStorage** to persist data
- Have clear documentation with JSDoc comments

### Available Functions:

#### 📥 FETCH DATA (GET requests)
```typescript
// Get all data at once
const data = await API.fetchAllData();

// Get specific data
const customers = await API.fetchCustomers();
const credits = await API.fetchCredits();
const shopInfo = await API.fetchShopInfo();
const staff = await API.fetchStaff();
const settings = await API.fetchSettings();

// Get data by ID
const customer = await API.fetchCustomerById('123');
const customerCredits = await API.fetchCreditsByCustomerId('123');
```

#### 💾 SAVE DATA (POST/PUT requests)
```typescript
// Create new records
await API.createCustomer(newCustomer);
await API.createCredit(newCredit);
await API.createStaff(newStaff);

// Update existing records
await API.updateCustomer(updatedCustomer);
await API.updateCredit(updatedCredit);
await API.updateShopInfo(shopInfo);
await API.updateSettings(settings);
await API.updateStaff(updatedStaff);

// Save all data
await API.saveAllData(appState);
```

#### 🗑️ DELETE DATA (DELETE requests)
```typescript
await API.deleteCustomer('123');
await API.deleteCredit('456');
await API.deleteStaff('789');
```

#### 🛠️ UTILITY FUNCTIONS
```typescript
// Clear all data
await API.clearAllData();

// Export/Import data as JSON
const jsonString = await API.exportDataAsJSON();
await API.importDataFromJSON(jsonString);
```

## 🎯 How to Use in Components

### Example 1: Fetching data in App.tsx
```typescript
import * as API from './api/apiService';

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await API.fetchAllData();
      setAppState(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  loadData();
}, []);
```

### Example 2: Creating a new customer
```typescript
const addCustomer = async (customerData) => {
  try {
    const newCustomer = await API.createCustomer({
      id: Date.now().toString(),
      name: customerData.name,
      phone: customerData.phone,
      createdAt: new Date().toISOString(),
    });
    console.log('Customer created:', newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
  }
};
```

### Example 3: Updating a credit
```typescript
const updateCredit = async (updatedCredit) => {
  try {
    await API.updateCredit(updatedCredit);
    console.log('Credit updated successfully');
  } catch (error) {
    console.error('Error updating credit:', error);
  }
};
```

## 🔄 How to Replace with Real Backend API

When you're ready to connect to a real backend (Supabase, Firebase, custom API), you only need to update `apiService.ts`:

### Example: Replace with Supabase
```typescript
// OLD (Local API)
export async function fetchCustomers(): Promise<Customer[]> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  return data.customers;
}

// NEW (Supabase API)
export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

### Example: Replace with Custom REST API
```typescript
// OLD (Local API)
export async function createCustomer(customer: Customer): Promise<Customer> {
  await delay(NETWORK_DELAY);
  const data = await fetchAllData();
  data.customers.push(customer);
  await saveAllData(data);
  return customer;
}

// NEW (REST API)
export async function createCustomer(customer: Customer): Promise<Customer> {
  const response = await fetch('https://api.yourserver.com/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  
  if (!response.ok) throw new Error('Failed to create customer');
  return response.json();
}
```

## 💡 Key Benefits

1. **Easy to understand**: Code reads like actual API calls
2. **Realistic behavior**: Async operations with network delay
3. **Easy to test**: All data is visible and editable in `database.ts`
4. **Easy to migrate**: Just replace function internals, not function calls
5. **Type-safe**: Full TypeScript support with proper types

## 🔍 Where Data is Stored

Currently, data is stored in:
- **localStorage** (browser storage)
- Key: `creditTrackerData`

To view the data:
1. Open browser DevTools (F12)
2. Go to "Application" or "Storage" tab
3. Click "Local Storage"
4. Find `creditTrackerData`

To clear all data:
```typescript
await API.clearAllData();
// or manually delete in DevTools
```

## 🚀 Next Steps

1. **Current Setup**: Data is stored locally in browser
2. **Future Setup**: Connect to real backend API
3. **Migration**: Only update `apiService.ts` functions
4. **Your app code**: No changes needed! 🎉

---

**Need help?** Check the JSDoc comments in `apiService.ts` for detailed function documentation.
