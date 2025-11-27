# 🏗️ Credit Tracker App - Architecture Overview

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│  (Dashboard, Customers, Credits, Reports, Settings, etc.)    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                        APP.TSX (Main)                        │
│  • Manages all state (customers, credits, shop info, etc.)  │
│  • Handles routing between pages                            │
│  • Loads/saves data via API Service                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    API SERVICE LAYER                         │
│                   (/api/apiService.ts)                       │
│  • fetchAllData()      - Get all data                       │
│  • fetchCustomers()    - Get customers                      │
│  • createCustomer()    - Add new customer                   │
│  • updateCredit()      - Update credit                      │
│  • deleteCustomer()    - Remove customer                    │
│  • ... and more API functions                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                            │
│                                                              │
│  LOCAL STORAGE (Current)     │   BACKEND API (Future)       │
│  • localStorage key:         │   • Supabase                 │
│    "creditTrackerData"       │   • Firebase                 │
│  • Browser-based             │   • Custom REST API          │
│  • No server needed          │   • GraphQL API              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Example: Adding a Customer

```
1. User fills form in AddCustomer component
   └─> Clicks "Save"

2. AddCustomer calls: onAddCustomer(customerData)
   └─> Passes data to App.tsx

3. App.tsx processes the data:
   const newCustomer = {
     ...customerData,
     id: Date.now().toString(),
     createdAt: new Date().toISOString()
   }
   
4. App.tsx updates state:
   setAppState(prev => ({
     ...prev,
     customers: [...prev.customers, newCustomer]
   }))

5. useEffect detects state change
   └─> Calls API.saveAllData(appState)

6. API Service saves to localStorage
   localStorage.setItem('creditTrackerData', JSON.stringify(appState))

7. User sees new customer in the list ✓
```

## 📁 File Structure

```
/
├── App.tsx                          # Main app component & state management
├── /api/
│   ├── database.ts                  # Sample data (mock database)
│   ├── apiService.ts                # API functions (like endpoints)
│   └── README.md                    # API documentation
├── /components/
│   ├── Dashboard.tsx                # Home screen
│   ├── Customers.tsx                # Customer list
│   ├── CustomerDetails.tsx          # Single customer view
│   ├── AddCustomer.tsx              # Add customer form
│   ├── AddCredit.tsx                # Add credit form
│   ├── AllCredits.tsx               # All credits view
│   ├── Reports.tsx                  # Reports & analytics
│   ├── SettingsPage.tsx             # App settings
│   ├── ShopProfile.tsx              # Shop information
│   ├── StaffManagement.tsx          # Staff management
│   ├── PaymentHistoryView.tsx       # Payment history display
│   ├── RecordPaymentModal.tsx       # Record payment modal
│   ├── BulkPaymentModal.tsx         # Bulk payment modal
│   ├── CreditDetailsModal.tsx       # Credit details modal
│   └── DeleteConfirmationModal.tsx  # Delete confirmation
└── /utils/
    └── formatNumber.ts              # Number formatting utility
```

## 🎯 Key Features & Their Locations

### 1. Payment History Tracking
**Files:**
- `App.tsx` - Credit type includes `paymentHistory: PaymentRecord[]`
- `RecordPaymentModal.tsx` - Records individual payments
- `BulkPaymentModal.tsx` - Records bulk payments
- `PaymentHistoryView.tsx` - Displays payment timeline

**Where it appears:**
- Dashboard (Recent Payments table)
- Customer Details (Payment history section)
- Credit Details Modal (Payment history section)

### 2. Customer Management
**Files:**
- `Customers.tsx` - List all customers
- `AddCustomer.tsx` - Add new customer
- `CustomerDetails.tsx` - View/edit customer details

**Data flow:**
```
AddCustomer → App.addCustomer() → API.createCustomer() → localStorage
```

### 3. Credit Management
**Files:**
- `AddCredit.tsx` - Add new credit with "Add New Customer" modal
- `AllCredits.tsx` - View all credits with search & filters
- `CreditDetailsModal.tsx` - Edit credit details

**Features:**
- FIFO payment logic (oldest credits paid first)
- Bulk payments across multiple credits
- Credit status tracking (paid/unpaid/partially-paid)

### 4. Reports & Analytics
**Files:**
- `Reports.tsx` - Generate PDF reports with charts

**Features:**
- Period selection (daily, weekly, monthly, yearly)
- Credit status breakdown
- Top customers
- Export to PDF

## 🔐 Data Types

### Customer
```typescript
{
  id: string;
  name: string;
  phone: string;
  createdAt: string; // ISO date
}
```

### Credit
```typescript
{
  id: string;
  customerId: string;
  item: string;
  remarks: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  images: string[];
  date: string; // ISO date
  status: 'paid' | 'unpaid' | 'partially-paid';
  paymentHistory: PaymentRecord[];
}
```

### PaymentRecord
```typescript
{
  id: string;
  amount: number;
  date: string; // ISO date
  remainingAfterPayment: number;
  note?: string;
}
```

## 🚀 How to Extend the App

### Add a New Feature

1. **Create component** in `/components/`
2. **Add route** in `App.tsx` renderView()
3. **Add navigation** in bottom nav bar
4. **Use API service** to fetch/save data

### Connect to Real Backend

1. **Open** `/api/apiService.ts`
2. **Replace function internals** (keep function signatures)
3. **No changes needed** in App.tsx or components!

Example:
```typescript
// Before (local)
export async function fetchCustomers() {
  const data = await fetchAllData();
  return data.customers;
}

// After (Supabase)
export async function fetchCustomers() {
  const { data } = await supabase.from('customers').select('*');
  return data;
}
```

## 💡 Best Practices

1. **Always use API functions** - Never access localStorage directly
2. **Use TypeScript types** - Import from App.tsx
3. **Follow async patterns** - Use async/await for API calls
4. **Handle errors** - Wrap API calls in try/catch
5. **Update state immutably** - Use spread operators

## 📝 Sample Data

The app comes pre-loaded with:
- **8 customers** with Ethiopian names
- **15 credits** with various payment states
- **Realistic payment histories** showing multiple payments
- **3 staff members** with different roles
- **Shop information** for "Addis Mart"

To reset data:
```typescript
await API.clearAllData();
// Refresh page to load default data
```

## 🎨 Theming

**Files:**
- `App.tsx` - Theme management
- `SettingsPage.tsx` - Theme toggle

**Themes:**
- Light mode (default)
- Dark mode

**Implementation:**
```typescript
// App.tsx applies theme class to <html>
if (settings.theme === 'dark') {
  document.documentElement.classList.add('dark');
}
```

## 🌍 Multi-language Support

**Languages:**
- English (en) ✓
- Amharic (am) ✓
- Afan Oromo (om) - Coming Soon

**How it works:**
```typescript
// Each component has translations object
const translations = {
  en: { greeting: 'Hello' },
  am: { greeting: 'ሰላም' },
};

// Use t() function to get translation
const t = (key) => translations[settings.language][key];
```

## 📊 State Management

**Current:** Local state in App.tsx
**Alternative options for scaling:**
- React Context API
- Redux
- Zustand
- Jotai

## 🔍 Debugging Tips

1. **View data:** DevTools → Application → Local Storage → `creditTrackerData`
2. **Check API calls:** Console logs show API activity
3. **Network delay:** 300ms delay simulates real API
4. **Clear data:** `await API.clearAllData()` in console

## 🎯 Next Steps

1. ✅ App is working with local database
2. 🔄 Test all features thoroughly
3. 🚀 When ready, connect to real backend
4. 🌐 Deploy to production

---

**Need help?** Check `/api/README.md` for detailed API documentation!
