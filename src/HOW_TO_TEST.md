# 🧪 How to Test the New User Flow

## ✨ Quick Test (2 minutes)

### **Method 1: Using the Debug Button (Easiest!)**

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Look for the RED button** at the bottom-right corner that says "Clear All Data (Debug)"

3. **Click it** and confirm

4. **You'll be redirected to the onboarding page!** ✅

5. **Enter test credentials:**
   - Phone: `+251912345678`
   - Telegram ID: `testuser`

6. **Click "Get Started"**

7. **You should see:**
   - ✅ Empty dashboard
   - ✅ All stats show "0 ETB" and "0"
   - ✅ Welcome message: "Welcome to Your Credit Tracker!"
   - ✅ "Add Your First Credit" button
   - ✅ Tables say "No data available"

---

### **Method 2: Using Browser Console**

1. **Open browser console** (Press F12)

2. **Run this command:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **You'll see the onboarding page!**

4. **Continue from step 5 above**

---

### **Method 3: Manual localStorage Check**

1. **Open browser console** (F12)

2. **Check what's in localStorage:**
   ```javascript
   // See all keys
   Object.keys(localStorage)
   
   // You might see old data like:
   // "creditTrackerData" ← OLD KEY (has dummy data)
   ```

3. **Remove old data:**
   ```javascript
   // Remove old data
   localStorage.removeItem('creditTrackerData');
   
   // Also remove current user if exists
   localStorage.removeItem('creditTracker_currentUser');
   
   // Reload
   location.reload();
   ```

4. **Now you'll see the onboarding page!**

---

## 🔍 Verify It's Working

### **Checklist After Onboarding:**

Go to the Dashboard and verify:

- [ ] **Stats Section:**
  - [ ] Total Credits: `0 ETB`
  - [ ] Paid Credits: `0 ETB`
  - [ ] Unpaid Credits: `0 ETB`
  - [ ] Customers: `0`

- [ ] **Welcome Card Shows:**
  - [ ] Blue gradient card with icon
  - [ ] Text: "Welcome to Your Credit Tracker!"
  - [ ] Text: "You're all set! Start by adding your first customer..."
  - [ ] Button: "Add Your First Credit"

- [ ] **Recent Credits Table:**
  - [ ] Shows: "No data available"

- [ ] **Recent Payments Table:**
  - [ ] Shows: "No data available"

- [ ] **Top Navigation:**
  - [ ] Shows user menu with your Telegram ID
  - [ ] Can click to see phone number
  - [ ] Has logout button

✅ **If all checked, you're seeing the new user experience!**

---

## ❌ Troubleshooting

### **Problem: Still seeing dummy data (8 customers, 15 credits)**

**Cause:** Old localStorage data from before authentication system

**Solution:**
```javascript
// Method 1: Use the red debug button
// Just click it!

// Method 2: Console command
localStorage.clear();
location.reload();

// Method 3: Remove specific key
localStorage.removeItem('creditTrackerData');
location.reload();
```

---

### **Problem: No red debug button visible**

**Solution:** 
- Make sure the app is running (`npm run dev`)
- Check bottom-right corner of the screen
- It should be floating above the bottom navigation

---

### **Problem: Stuck in a loop / Not redirecting to onboarding**

**Solution:**
```javascript
// Force clear and go to onboarding
localStorage.clear();
window.location.href = 'http://localhost:3000/onboarding';
```

---

### **Problem: After entering details, still shows old data**

**Cause:** You might be logged in with an account that already has data

**Solution:**
```javascript
// Check current user
const user = localStorage.getItem('creditTracker_currentUser');
console.log(JSON.parse(user));

// Clear their data
const userId = JSON.parse(user).id;
localStorage.removeItem(`creditTrackerData_user_${userId}`);

// Or just logout and start fresh
localStorage.clear();
location.reload();
```

---

## 🎯 Testing Different Scenarios

### **Scenario 1: Brand New User**

```javascript
// 1. Clear everything
localStorage.clear();
location.reload();

// 2. Fill onboarding form
// Phone: +251911111111
// Telegram ID: newuser1

// 3. Expected Result:
// ✅ Empty dashboard
// ✅ 0 customers, 0 credits
```

---

### **Scenario 2: Second User on Same Device**

```javascript
// 1. Click logout (user menu → logout)

// 2. You'll see onboarding again

// 3. Fill with different credentials
// Phone: +251922222222
// Telegram ID: newuser2

// 4. Expected Result:
// ✅ New empty dashboard for this user
// ✅ First user's data is still saved, just not visible
```

---

### **Scenario 3: Returning User**

```javascript
// 1. Add some data (customers, credits)

// 2. Close browser completely

// 3. Open browser again, go to http://localhost:3000

// 4. Expected Result:
// ✅ Auto-logged in
// ✅ See your data (not empty anymore)
```

---

### **Scenario 4: Switch Between Users**

```javascript
// User 1 adds data, logs out
// User 2 logs in (new account) → sees empty
// User 2 adds different data
// User 2 logs out
// User 1 logs back in → sees their original data!
// (Each user's data is isolated)
```

---

## 📊 Check localStorage Structure

### **After Creating Account:**

```javascript
// In console (F12):
Object.keys(localStorage)

// You should see:
// [
//   "creditTracker_currentUser",           ← Current logged in user
//   "creditTrackerData_user_1732547890123" ← User's app data
// ]

// View current user:
localStorage.getItem('creditTracker_currentUser')
// Returns: {"id":"1732547890123","phoneNumber":"+251912345678","telegramId":"testuser",...}

// View user's data:
localStorage.getItem('creditTrackerData_user_1732547890123')
// Returns: {"customers":[],"credits":[],"shopInfo":null,...} ← All empty!
```

---

## 🎨 Visual Checklist

### **What You Should See (New User):**

```
┌─────────────────────────────────────────┐
│  Credit Tracker    [Settings] [@testuser]│  ← Top Nav
├─────────────────────────────────────────┤
│                                         │
│  Dashboard                 [+ Add Credit]│
│  Welcome back! Here's what's...         │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │  0  │ │  0  │ │  0  │ │  0  │      │  ← Stats (all zero)
│  │ ETB │ │ ETB │ │ ETB │ │  -  │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎉 Welcome to Your Credit      │   │  ← Empty State
│  │    Tracker!                     │   │
│  │                                 │   │
│  │ You're all set! Start by...    │   │
│  │                                 │   │
│  │  [Add Your First Credit]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Recent Credits                         │
│  ┌─────────────────────────────────┐   │
│  │      No data available          │   │  ← Empty table
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Success Criteria

You know it's working when:

1. ✅ Onboarding page shows first (beautiful gradient design)
2. ✅ After signup, dashboard is COMPLETELY empty
3. ✅ All numbers show "0" or "0 ETB"
4. ✅ Tables say "No data available"
5. ✅ Big welcome card is visible
6. ✅ "Add Your First Credit" button is prominent
7. ✅ Top nav shows your Telegram ID
8. ✅ Can logout and see onboarding again

---

## 🚀 Quick Commands Reference

```javascript
// Clear everything and start fresh
localStorage.clear();
location.reload();

// See all storage keys
Object.keys(localStorage);

// See current user
JSON.parse(localStorage.getItem('creditTracker_currentUser'));

// See user's data (replace userId)
JSON.parse(localStorage.getItem('creditTrackerData_user_1732547890123'));

// Logout manually
localStorage.removeItem('creditTracker_currentUser');
location.reload();

// Go to onboarding directly
window.location.href = '/onboarding';
```

---

## 🎯 Next Steps After Testing

Once you verify the empty state works:

1. **Test adding data:**
   - Add a customer
   - Add a credit
   - Verify it saves

2. **Test logout:**
   - Click logout
   - See onboarding again

3. **Test login:**
   - Enter same credentials
   - Verify you see your data

4. **Test second user:**
   - Logout
   - Create new account with different details
   - Verify it's empty again

5. **Remove debug button** (when done testing):
   - Edit `/app/layout.tsx`
   - Remove the `<ClearDataButton />` line

---

## 📱 Mobile Testing

```bash
# Get your local IP
# Mac/Linux:
ipconfig getifaddr en0

# Windows:
ipconfig

# Then visit on mobile:
http://YOUR_IP:3000
```

---

**Still having issues? Check `/AUTHENTICATION_GUIDE.md` for more details!** 📖
