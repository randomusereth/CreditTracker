# 🚀 Quick Start Guide - Credit Tracker

## ✅ What's Been Set Up

Your Credit Tracker app now has:

✓ **Local Database** with rich sample data (8 customers, 15 credits)  
✓ **API Service Layer** that mimics real server calls  
✓ **Payment History Tracking** with full audit trail  
✓ **Payment History Display** on Dashboard, Customer Details, and Credit Modal  
✓ **Async Data Operations** just like a real backend API  

## 📂 Key Files to Know

```
/api/database.ts       ← Sample data (your "database")
/api/apiService.ts     ← API functions (your "endpoints")
/api/README.md         ← Detailed API documentation
/ARCHITECTURE.md       ← System architecture overview
/App.tsx               ← Main app & state management
```

## 🎯 Common Tasks

### View Your Data
**In Browser DevTools:**
1. Press F12
2. Go to "Application" tab
3. Expand "Local Storage"
4. Click on your domain
5. Find key: `creditTrackerData`
6. See all your data in JSON format

### Add More Sample Data
**Edit `/api/database.ts`:**
```typescript
export const customersData: Customer[] = [
  // Add more customers here
  { id: '9', name: 'New Customer', phone: '+251900000000', ... },
];
```

### Understand Data Flow
**When user adds a customer:**
```
1. User fills form → AddCustomer component
2. Component calls: onAddCustomer(data)
3. App.tsx: addCustomer() function runs
4. State updates with new customer
5. useEffect detects change
6. Calls: API.saveAllData(appState)
7. API Service saves to localStorage
8. Done! ✓
```

### Use API Service in Code
```typescript
// Import the API
import * as API from './api/apiService';

// Fetch data
const customers = await API.fetchCustomers();
const credits = await API.fetchCredits();

// Create new record
await API.createCustomer(newCustomer);

// Update existing record
await API.updateCredit(updatedCredit);

// Delete record
await API.deleteCustomer(customerId);
```

## 🔍 Testing the App

### Test Payment History
1. Go to Dashboard
2. See "Recent Payments" table with sample payments
3. Click any customer → Customer Details
4. See all their payment history
5. Click any credit in the table
6. Modal opens with payment timeline

### Test Adding Data
1. Go to Customers page
2. Click "Add Customer"
3. Fill form and save
4. Customer appears immediately
5. Check DevTools → Local Storage → data is saved!

### Test API Delay
Notice the 300ms delay? That simulates network latency!
```typescript
// In apiService.ts
const NETWORK_DELAY = 300; // Change this to adjust speed
```

## 🔄 Connect to Real Backend (Future)

When you're ready to use a real backend:

### Option 1: Supabase
```typescript
// In apiService.ts, replace functions like:
export async function fetchCustomers() {
  const { data } = await supabase.from('customers').select('*');
  return data;
}
```

### Option 2: REST API
```typescript
export async function fetchCustomers() {
  const response = await fetch('https://api.yourserver.com/customers');
  return response.json();
}
```

### Option 3: Firebase
```typescript
export async function fetchCustomers() {
  const snapshot = await getDocs(collection(db, 'customers'));
  return snapshot.docs.map(doc => doc.data());
}
```

**Important:** Only update `/api/apiService.ts` - no changes needed in App.tsx or components!

## 📊 Sample Data Overview

### Customers (8 total)
- Abebe Kebede, Tigist Alemayehu, Mulugeta Haile, Sara Mohammed, Dawit Tesfaye, Almaz Bekele, Yohannes Tadesse, Hanna Wolde

### Credits (15 total)
- Various products: Sugar, Rice, Flour, Oil, Coffee, Tea, Pasta, etc.
- Mix of paid/unpaid/partially-paid statuses
- Realistic payment histories showing multiple payments

### Staff (3 members)
- Lemlem Assefa (Manager - full permissions)
- Getachew Mamo (Cashier - limited)
- Bethlehem Desta (Sales Assistant - limited)

### Shop Info
- Name: Addis Mart
- Location: Bole, Addis Ababa
- Contact info included

## 🛠️ Customization

### Change Network Delay
```typescript
// /api/apiService.ts
const NETWORK_DELAY = 300; // Change to 0 for instant, 1000 for slower
```

### Add More Customers
```typescript
// /api/database.ts
export const customersData: Customer[] = [
  { id: '9', name: 'Your Name', phone: '+251999999999', createdAt: '...' },
  // Add more...
];
```

### Clear All Data
```typescript
// In browser console:
await API.clearAllData();
// Then refresh page to reload default data
```

## 🎨 Features Overview

### ✓ Customer Management
- Add, edit, delete customers
- View customer credit history
- Search and filter

### ✓ Credit Management  
- Add credits with optional initial payment
- Record individual payments
- Bulk payments (FIFO logic)
- Payment history tracking

### ✓ Payment History
- **Dashboard:** Recent payments across all customers
- **Customer Details:** All payments for that customer
- **Credit Modal:** Payment timeline for specific credit

### ✓ Reports
- PDF export with charts
- Filter by period (daily/weekly/monthly/yearly)
- Top customers analytics

### ✓ Settings
- Dark/Light theme
- Language: English, Amharic (Oromo coming soon)
- Shop profile management

### ✓ Staff Management
- Up to 3 staff members
- Role-based permissions
- Access control

## 💡 Pro Tips

1. **Check Console Logs:** API calls are logged for debugging
2. **Use TypeScript:** Import types from App.tsx for type safety
3. **Async/Await:** Always use async/await with API functions
4. **Error Handling:** Wrap API calls in try/catch blocks
5. **DevTools:** Use React DevTools to inspect component state

## 🆘 Troubleshooting

### Data Not Saving?
- Check browser console for errors
- Verify localStorage is enabled
- Try: `await API.clearAllData()` and refresh

### API Not Working?
- Check imports: `import * as API from './api/apiService'`
- Use async/await: `await API.fetchCustomers()`
- Check function names match the API service

### Payment History Not Showing?
- Check if credit has paymentHistory array
- Verify PaymentRecord type is correct
- Check component is receiving correct props

## 📚 More Resources

- **API Documentation:** See `/api/README.md`
- **Architecture Overview:** See `/ARCHITECTURE.md`
- **Main App Logic:** Check `/App.tsx` comments

## 🎯 Next Steps

1. ✅ Explore the app - click around and test features
2. ✅ Check the sample data in `/api/database.ts`
3. ✅ Try adding new customers and credits
4. ✅ Record some payments and see the history
5. ✅ Look at the code structure in `/api/apiService.ts`
6. 🔜 When ready, connect to your real backend!

---

**Have fun building! 🚀** The code is clean, well-documented, and ready to extend!
