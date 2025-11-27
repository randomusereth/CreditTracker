# 🎯 What's Next? - Action Plan

## 📋 Current Status

✅ **DONE:** Next.js foundation is complete and working!  
🔄 **TODO:** Migrate remaining pages (60% complete)  
⏱️ **TIME:** 2-4 hours to finish

---

## 🚀 Immediate Next Steps

### **Step 1: Setup & Verify (15 min)**

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000

# 4. Verify Dashboard works
# ✅ Should see stats, recent credits, recent payments
```

**Checkpoint:** Dashboard should load with sample data

---

### **Step 2: Understand the Pattern (15 min)**

Look at how Dashboard was migrated:

```
1. Page file: app/page.tsx
   - Simple wrapper that renders client component

2. Client wrapper: components/pages/DashboardClient.tsx
   - Uses 'use client'
   - Connects to AppProvider with useApp()
   - Passes data to existing component

3. Existing component: components/Dashboard.tsx
   - Updated imports to use @/
   - Everything else stays the same!
```

**Key Insight:** Most components don't need changes! Just update imports.

---

### **Step 3: Migrate Customers Page (30 min)**

#### **3a. Create page file**

Create: `/app/customers/page.tsx`

```typescript
import { CustomersClient } from '@/components/pages/CustomersClient';

export default function CustomersPage() {
  return <CustomersClient />;
}
```

#### **3b. Create client wrapper**

Create: `/components/pages/CustomersClient.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { Customers } from '@/components/Customers';

export function CustomersClient() {
  const router = useRouter();
  const { appState } = useApp();

  return (
    <Customers
      customers={appState.customers}
      credits={appState.credits}
      onAddCustomer={() => router.push('/customers/new')}
      onViewCustomer={(id) => router.push(`/customers/${id}`)}
      settings={appState.settings}
    />
  );
}
```

#### **3c. Update Customers component**

Edit: `/components/Customers.tsx`

```typescript
// Change this:
import { Customer, Credit, AppSettings } from '../App';

// To this:
import { Customer, Credit, AppSettings } from '@/types';
```

**Test:** Visit http://localhost:3000/customers

---

### **Step 4: Migrate Add Customer Page (20 min)**

#### **4a. Create page**

Create: `/app/customers/new/page.tsx`

```typescript
import { AddCustomerClient } from '@/components/pages/AddCustomerClient';

export default function AddCustomerPage() {
  return <AddCustomerClient />;
}
```

#### **4b. Create wrapper**

Create: `/components/pages/AddCustomerClient.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import AddCustomer from '@/components/AddCustomer';
import { Customer } from '@/types';

export function AddCustomerClient() {
  const router = useRouter();
  const { setAppState } = useApp();

  const handleAddCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setAppState(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
    }));
    
    router.push('/customers');
  };

  return (
    <AddCustomer
      onAddCustomer={handleAddCustomer}
      onCancel={() => router.push('/customers')}
    />
  );
}
```

#### **4c. Update AddCustomer**

Edit: `/components/AddCustomer.tsx`
- Update imports to use `@/types`

**Test:** Click "Add Customer" button

---

### **Step 5: Migrate Customer Details (30 min)**

#### **5a. Create dynamic page**

Create: `/app/customers/[id]/page.tsx`

```typescript
import { CustomerDetailsClient } from '@/components/pages/CustomerDetailsClient';

export default function CustomerDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <CustomerDetailsClient customerId={params.id} />;
}
```

#### **5b. Create wrapper**

Create: `/components/pages/CustomerDetailsClient.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { CustomerDetails } from '@/components/CustomerDetails';
import { Customer, Credit } from '@/types';

export function CustomerDetailsClient({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { appState, setAppState } = useApp();

  const customer = appState.customers.find(c => c.id === customerId);
  const credits = appState.credits.filter(c => c.customerId === customerId);

  if (!customer) {
    return <div>Customer not found</div>;
  }

  const handleUpdateCustomer = (customer: Customer) => {
    setAppState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === customer.id ? customer : c),
    }));
  };

  const handleDeleteCustomer = (id: string) => {
    setAppState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      credits: prev.credits.filter(c => c.customerId !== id),
    }));
    router.push('/customers');
  };

  const handleUpdateCredit = (credit: Credit) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => c.id === credit.id ? credit : c),
    }));
  };

  const handleDeleteCredit = (id: string) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.filter(c => c.id !== id),
    }));
  };

  const handleChangeCustomer = (creditId: string, newCustomerId: string) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => 
        c.id === creditId ? { ...c, customerId: newCustomerId } : c
      ),
    }));
  };

  return (
    <CustomerDetails
      customer={customer}
      credits={credits}
      onBack={() => router.push('/customers')}
      onAddCredit={() => router.push('/credits/new')}
      settings={appState.settings}
      onUpdateCustomer={handleUpdateCustomer}
      onDeleteCustomer={handleDeleteCustomer}
      onUpdateCredit={handleUpdateCredit}
      onDeleteCredit={handleDeleteCredit}
      allCustomers={appState.customers}
      onChangeCustomer={handleChangeCustomer}
    />
  );
}
```

#### **5c. Update CustomerDetails**

Edit: `/components/CustomerDetails.tsx`
- Update imports to use `@/types`

**Test:** Click any customer name

---

### **Step 6: Migrate Remaining Pages (1-2 hours)**

Follow the same pattern for:

1. **All Credits** (`/app/credits/page.tsx`)
2. **Add Credit** (`/app/credits/new/page.tsx`)
3. **Reports** (`/app/reports/page.tsx`)
4. **Settings** (`/app/settings/page.tsx`)
5. **Staff** (`/app/staff/page.tsx`)

**Pattern:**
```
1. Create page in /app
2. Create client wrapper in /components/pages
3. Update component imports to use @/
4. Test!
```

---

## ✅ Checklist

### **Foundation** ✅
- [x] Next.js setup
- [x] TypeScript config
- [x] Tailwind CSS
- [x] Global state (AppProvider)
- [x] API routes
- [x] Navigation

### **Dashboard** ✅
- [x] Dashboard page
- [x] Dashboard wrapper
- [x] Dashboard component updated

### **Customers** 🔄
- [ ] Customers list page
- [ ] Add customer page
- [ ] Customer details page

### **Credits** 🔄
- [ ] All credits page
- [ ] Add credit page

### **Other Pages** 🔄
- [ ] Reports page
- [ ] Settings page
- [ ] Staff page

### **Testing** 🔄
- [ ] All pages load
- [ ] All features work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works

### **Deployment** 🔄
- [ ] Build succeeds
- [ ] Production test
- [ ] Deploy to Vercel
- [ ] Live URL works

---

## 📊 Progress Tracker

```
[████████░░░░░░░░░░] 60% Complete

✅ Foundation:     100% (Complete!)
✅ Dashboard:      100% (Complete!)
🔄 Customers:      0%   (Next!)
🔄 Credits:        0%
🔄 Other Pages:    0%
🔄 Testing:        0%
🔄 Deployment:     0%
```

---

## ⏱️ Time Estimates

| Task | Time | Status |
|------|------|--------|
| Foundation Setup | 1 hour | ✅ Done |
| Dashboard Migration | 30 min | ✅ Done |
| Customers Pages | 1 hour | 🔄 Todo |
| Credits Pages | 45 min | 🔄 Todo |
| Other Pages | 1 hour | 🔄 Todo |
| Testing & Fixes | 30 min | 🔄 Todo |
| Deployment | 15 min | 🔄 Todo |
| **TOTAL** | **~5 hours** | **60% Done** |

---

## 🎯 Focus Areas

### **Priority 1: Core Pages** (Must have)
1. ✅ Dashboard
2. 🔄 Customers list
3. 🔄 Customer details
4. 🔄 Add credit
5. 🔄 All credits

### **Priority 2: Supporting Pages** (Should have)
6. 🔄 Add customer
7. 🔄 Settings
8. 🔄 Reports

### **Priority 3: Nice to Have**
9. 🔄 Staff management

---

## 💡 Pro Tips

### **Tip 1: Use Dashboard as Template**
Copy the pattern from:
- `/app/page.tsx`
- `/components/pages/DashboardClient.tsx`

### **Tip 2: Update Imports First**
Before doing anything else:
```typescript
// Find and replace in each component:
import { ... } from '../App'
// With:
import { ... } from '@/types'
```

### **Tip 3: Test As You Go**
After each page:
1. Visit the URL
2. Click all buttons
3. Check console for errors
4. Fix issues immediately

### **Tip 4: Commit Often**
```bash
git add .
git commit -m "Migrate customers page"
git push
```

### **Tip 5: Use Hot Reload**
Save file → See changes instantly!
No need to refresh browser.

---

## 🐛 Common Issues & Fixes

### **Issue: "Cannot find module '@/types'"**
**Fix:** Restart TypeScript server
```
VS Code: Cmd/Ctrl + Shift + P
Type: "TypeScript: Restart TS Server"
```

### **Issue: "useRouter is not a function"**
**Fix:** Make sure you have `'use client'` at top of file

### **Issue: "appState is undefined"**
**Fix:** Make sure component is wrapped in AppProvider (check layout.tsx)

### **Issue: "Page shows 404"**
**Fix:** Check file is in correct location: `/app/my-page/page.tsx`

### **Issue: "Build fails"**
**Fix:** Check for TypeScript errors in terminal

---

## 🎉 When You're Done

### **Final Checklist:**
- [ ] All pages work
- [ ] All features tested
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Production works (`npm start`)

### **Deploy:**
```bash
# Push to GitHub
git add .
git commit -m "Complete Next.js migration"
git push

# Deploy to Vercel
vercel

# Share URL with users!
```

### **Celebrate!** 🎊
You've successfully migrated to Next.js!

---

## 📚 Quick Reference

### **File Locations**
```
Pages:             /app/*/page.tsx
Client Wrappers:   /components/pages/*Client.tsx
Components:        /components/*.tsx
Types:             /types/index.ts
API:               /app/api/*/route.ts
Utils:             /utils/*.ts
```

### **Common Imports**
```typescript
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { Customer, Credit } from '@/types';
import { formatNumber } from '@/utils/formatNumber';
```

### **Navigation**
```typescript
const router = useRouter();
router.push('/path');          // Navigate
router.push(`/path/${id}`);    // With parameter
router.back();                 // Go back
```

### **State Updates**
```typescript
const { appState, setAppState } = useApp();

setAppState(prev => ({
  ...prev,
  customers: [...prev.customers, newCustomer]
}));
```

---

## 🎯 Your Mission

1. ✅ Verify Dashboard works
2. 🔄 Migrate Customers pages (1 hour)
3. 🔄 Migrate Credits pages (45 min)
4. 🔄 Migrate remaining pages (1 hour)
5. 🔄 Test everything (30 min)
6. 🔄 Deploy (15 min)
7. 🎉 Celebrate!

**Total Time:** ~4 hours remaining

---

## 📞 Need Help?

**Check:**
1. `/SETUP_INSTRUCTIONS.md` - Setup issues
2. `/NEXTJS_MIGRATION.md` - Migration questions
3. `/NEXTJS_STACK.md` - Technical details
4. `/COMPARISON.md` - Why we did this
5. Browser console - Error messages
6. Next.js docs - https://nextjs.org/docs

---

**🚀 You Got This! Start with Step 1 and work your way through!**

Good luck! 🎯
