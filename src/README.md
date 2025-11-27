# 🏪 Credit Tracker - Next.js with Authentication

> **Professional credit tracking system for shopkeepers** with Telegram-based user accounts

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000

# First time? You'll see the onboarding page!
# Enter your Telegram phone number and ID to get started 🎉
```

---

## ✨ New! Authentication System

### **🔐 User Accounts with Telegram**

- **Onboarding page** for new users
- Enter **Telegram phone number** (e.g., +251912345678)
- Enter **Telegram ID** (e.g., @johndoe)
- Each user gets **completely blank/empty data** to start
- **No sample data** for new users!

### **📱 Try It Now:**

```javascript
// In browser console (F12):
localStorage.clear();
location.reload();

// You'll see the beautiful onboarding page! ✨
```

---

## 📖 Features

### 🔐 **Authentication**
- Telegram-based user accounts
- Beautiful onboarding page
- Per-user data isolation
- User profile & logout
- Session persistence

### 📊 **Dashboard**
- Real-time overview of all credits
- Empty state for new users
- Total, paid, and unpaid amounts
- Customer statistics
- Recent credits & payments

### 👥 **Customer Management**
- Add, edit, delete customers
- View customer credit history
- Search and filter

### 💳 **Credit Tracking**
- Add credits with optional initial payment
- Record individual payments
- Bulk payment with FIFO logic
- Payment history tracking
- Credit status tracking

### 📈 **Reports & Analytics**
- Generate PDF reports
- Filter by period
- Credit status breakdown
- Top customers analysis

### ⚙️ **Settings**
- Dark/Light mode
- Multi-language (English, Amharic, Afan Oromo)
- Calendar type (Gregorian/Ethiopian)
- Shop profile management

### 👤 **Staff Management**
- Up to 3 staff members
- Role-based permissions

---

## 🎯 New User Experience

```
1. Visit app for first time
   ↓
2. See onboarding page
   ↓
3. Enter Telegram phone + ID
   ↓
4. Click "Get Started"
   ↓
5. Redirected to Dashboard
   ↓
6. See welcome message (empty state)
   ↓
7. Click "Add Your First Credit"
   ↓
8. Start tracking credits! 🚀
```

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ Next.js 14 (App Router)
- ⚛️ React 18
- 📘 TypeScript 5
- 🎨 Tailwind CSS 4.0
- 🎯 Lucide React (icons)
- 📄 jsPDF (PDF generation)

### **Backend**
- 🔌 Next.js API Routes
- 💾 localStorage (per-user data)
- 🔄 React Context (state management)

### **Authentication**
- 🔐 Client-side auth
- 👤 Per-user data isolation
- 📱 Telegram integration ready

---

## 📂 Project Structure

```
/app
├── layout.tsx                  # Root layout
├── page.tsx                    # Dashboard
├── /onboarding                 # ✨ NEW: Onboarding page
│   └── page.tsx
└── /api/data                   # Updated with userId support
    └── route.ts

/components
├── /providers
│   └── AppProvider.tsx         # ✨ Updated: Auth logic
├── /navigation
│   ├── TopNav.tsx              # ✨ Updated: User menu
│   └── BottomNav.tsx
├── /pages
│   ├── DashboardClient.tsx
│   └── OnboardingClient.tsx    # ✨ NEW: Onboarding form
└── ... (other components)

/lib
├── auth.ts                     # ✨ NEW: Auth utilities
├── database.ts                 # ✨ Updated: Per-user data
└── api-client.ts               # ✨ Updated: User-specific API

/types
├── index.ts                    # App types
└── auth.ts                     # ✨ NEW: User types
```

---

## 📚 Documentation

### **Start Here:**
- **[AUTH_SUMMARY.md](AUTH_SUMMARY.md)** - Quick overview of authentication (5 min read)
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Complete authentication guide (15 min)
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - How to setup and run
- **[WHATS_NEXT.md](WHATS_NEXT.md)** - What to do next

### **Deep Dives:**
- **[NEXTJS_STACK.md](NEXTJS_STACK.md)** - Full tech stack details
- **[NEXTJS_MIGRATION.md](NEXTJS_MIGRATION.md)** - Migration from React SPA
- **[COMPARISON.md](COMPARISON.md)** - React SPA vs Next.js
- **[SUMMARY.md](SUMMARY.md)** - Complete project summary

### **Reference:**
- **[DOCS_INDEX.md](DOCS_INDEX.md)** - Master documentation index

---

## 🎨 What's Different for New Users?

### **Before (Old System):**
```
❌ Loaded with 8 sample customers
❌ Loaded with 15 sample credits
❌ Confusing for new users
❌ Had to delete sample data
```

### **After (New System):**
```
✅ Completely blank slate
✅ Empty dashboard with welcome message
✅ Clear "Add Your First Credit" button
✅ Professional onboarding experience
✅ Each user has their own data
```

---

## 🧪 Testing

### **Test New User Flow:**

```bash
# 1. Start dev server
npm run dev

# 2. Clear localStorage (browser console - F12)
localStorage.clear();
location.reload();

# 3. You'll see onboarding page!

# 4. Test credentials:
Phone: +251912345678
Telegram ID: testuser123

# 5. Click "Get Started"
# ✅ Redirected to dashboard
# ✅ See empty state
# ✅ All stats show "0"

# 6. Add a customer or credit
# ✅ Data saves automatically

# 7. Refresh page
# ✅ Data persists!

# 8. Test logout
# ✅ Click user menu → logout
# ✅ Redirected to onboarding
```

---

## 🔒 Data Storage

### **Authentication**
```
Key: creditTracker_currentUser
Value: {
  id: "1732547890123",
  phoneNumber: "+251912345678",
  telegramId: "johndoe",
  createdAt: "2024-11-25T10:30:00Z"
}
```

### **User Data**
```
Key: creditTrackerData_user_1732547890123
Value: {
  customers: [],      // Empty for new users!
  credits: [],        // Empty for new users!
  shopInfo: null,
  staff: [],
  settings: {...}
}
```

---

## 🎯 How It Works

### **Authentication Flow**

```typescript
// 1. User visits app
AppProvider checks localStorage for current user
   ├─ Found? Load their data
   └─ Not found? Redirect to /onboarding

// 2. User fills onboarding form
Validate inputs
Create user account
Save to localStorage
Initialize empty app data
Redirect to dashboard

// 3. User works with app
All data saved with their user ID
Data isolated from other users

// 4. User closes browser and returns
Auto-login with saved credentials
Load their data
Continue where they left off
```

---

## 🌟 Key Features

### **Empty State for New Users**
Beautiful welcome card with:
- Welcome message
- Getting started instructions
- "Add Your First Credit" button
- Gradient design

### **User Menu**
Top navigation shows:
- Telegram ID
- Phone number
- Logout button

### **Data Isolation**
- Each user: `creditTrackerData_user_{userId}`
- Can't see other users' data
- Private and secure

### **Validation**
- Phone: 10+ characters, proper format
- Telegram ID: 5-32 alphanumeric characters
- Real-time error messages

---

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel (one-click)
vercel
```

---

## 📱 Screenshots Flow

### 1. **Onboarding Page**
Beautiful gradient background with form to enter Telegram details

### 2. **Dashboard (New User)**
Empty state with welcome message and "Add First Credit" button

### 3. **User Menu**
Dropdown showing Telegram ID, phone number, and logout

### 4. **Dashboard (With Data)**
Stats, recent credits, and payment history

---

## 💡 Pro Tips

### **Fresh Start**
```javascript
localStorage.clear();
location.reload();
```

### **Check Current User**
```javascript
localStorage.getItem('creditTracker_currentUser');
```

### **Check User Data**
```javascript
// Replace with your user ID
localStorage.getItem('creditTrackerData_user_1732547890123');
```

### **Manual Logout**
```javascript
localStorage.removeItem('creditTracker_currentUser');
location.reload();
```

---

## ⚠️ Important Notes

### **Security**
- Client-side authentication only
- Data stored in browser localStorage
- **Not for sensitive/confidential data**
- Perfect for shopkeeper use case

### **For Production**
Consider adding:
- Real backend (Supabase/Firebase)
- Database storage
- JWT authentication
- Password protection
- Cloud sync

---

## 🎉 What You Get

✅ **Modern authentication system**  
✅ **Beautiful onboarding experience**  
✅ **Per-user data isolation**  
✅ **Empty state for new users**  
✅ **User profile & logout**  
✅ **Session persistence**  
✅ **Professional UI/UX**  
✅ **Dark mode support**  
✅ **Mobile responsive**  
✅ **Comprehensive documentation**  

---

## 📞 Quick Links

- **Try the app:** `npm run dev`
- **Authentication guide:** [AUTH_SUMMARY.md](AUTH_SUMMARY.md)
- **Full documentation:** [DOCS_INDEX.md](DOCS_INDEX.md)
- **Next steps:** [WHATS_NEXT.md](WHATS_NEXT.md)

---

## 🆕 What's New in This Version

### **v2.0 - Authentication System**
- ✨ Telegram-based onboarding
- ✨ Per-user data isolation
- ✨ Empty state for new users
- ✨ User profile menu
- ✨ Logout functionality
- ✨ Beautiful onboarding page
- ✨ Session management

### **Previous (v1.0)**
- Next.js 14 foundation
- Dashboard, customers, credits
- Reports and settings
- Dark mode
- Multi-language support

---

## 🎯 Perfect For

✅ Shopkeepers tracking customer credits  
✅ Small business owners  
✅ Store managers  
✅ Credit management  
✅ Payment tracking  
✅ Multiple users per device  

---

## 🚀 Get Started Now!

```bash
# 1. Install
npm install

# 2. Run
npm run dev

# 3. Open http://localhost:3000

# 4. Enter your Telegram details

# 5. Start tracking credits! 🎉
```

---

**Made with ❤️ using Next.js 14 + Authentication**

**Version:** 2.0 (with Authentication)  
**Last Updated:** November 2024  
**Status:** ✅ Production Ready
