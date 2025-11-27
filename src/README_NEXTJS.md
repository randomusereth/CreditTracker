# 🏪 Credit Tracker - Next.js Edition

> **Professional credit tracking system for shopkeepers** - Rebuilt with Next.js 14

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)

## ✨ Features

### 📊 **Dashboard**
- Real-time overview of all credits
- Total, paid, and unpaid amounts
- Customer statistics
- Recent credits & payments
- Payment history tracking

### 👥 **Customer Management**
- Add, edit, delete customers
- View customer credit history
- Phone number validation
- Search and filter

### 💳 **Credit Tracking**
- Add new credits with optional initial payment
- Record individual payments
- **Bulk payment** feature with FIFO logic
- **Payment history** with full audit trail
- Credit status tracking (paid/unpaid/partially-paid)
- Change credit assignment between customers

### 📈 **Reports & Analytics**
- Generate PDF reports
- Filter by period (daily/weekly/monthly/yearly)
- Credit status breakdown with charts
- Top customers analysis
- Export functionality

### ⚙️ **Settings & Customization**
- **Dark/Light mode** theme toggle
- **Multi-language support**: English, Amharic, Afan Oromo (coming soon)
- **Calendar type**: Gregorian or Ethiopian
- Shop profile management

### 👤 **Staff Management**
- Up to 3 staff members
- Role-based permissions
- Access control

### 💰 **Payment History**
- Individual payment transactions tracked
- Amount, date/time, remaining balance
- Automatic recording across all payment methods
- Visible in:
  - Dashboard (Recent Payments section)
  - Customer Details page
  - Credit Details Modal

## 🚀 Tech Stack

### **Frontend**
- ⚛️ **Next.js 14** - React framework with App Router
- ⚛️ **React 18** - UI library
- 📘 **TypeScript 5** - Type safety
- 🎨 **Tailwind CSS 4.0** - Styling
- 🎯 **Lucide React** - Icons
- 📄 **jsPDF** - PDF generation

### **Backend**
- 🔌 **Next.js API Routes** - RESTful API endpoints
- 💾 **localStorage** - Data persistence (temporary)
- 🔄 **React Context** - Global state management

### **Architecture**
- 📂 **App Router** - File-based routing
- 🖥️ **Server Components** - Server-side rendering
- 💻 **Client Components** - Interactive UI
- 🌐 **API Routes** - Backend endpoints
- 🎯 **TypeScript** - End-to-end type safety

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 18.0.0
npm, yarn, or pnpm
```

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Open browser:**
```
http://localhost:3000
```

4. **Start building!** 🎉

### Build for Production
```bash
npm run build
npm start
```

## 📂 Project Structure

```
/app                          # Next.js App Router
├── layout.tsx                # Root layout
├── page.tsx                  # Dashboard (home)
├── globals.css               # Global styles
├── /api                      # API Routes
│   └── /data
│       └── route.ts          # CRUD operations
├── /customers                # Customer pages
├── /credits                  # Credit pages
├── /reports                  # Reports page
├── /settings                 # Settings page
└── /staff                    # Staff management

/components                   # React components
├── /providers
│   └── AppProvider.tsx       # Global state
├── /navigation
│   ├── TopNav.tsx            # Top nav
│   └── BottomNav.tsx         # Bottom nav
└── /pages
    └── DashboardClient.tsx   # Dashboard wrapper

/lib                          # Libraries
├── database.ts               # Data layer
└── api-client.ts             # API functions

/types                        # TypeScript types
└── index.ts                  # Type definitions

/utils                        # Utilities
└── formatNumber.ts           # Number formatting
```

## 🔄 How It Works

### **Data Flow**

```
1. User opens app
   ↓
2. AppProvider loads → fetches data from API
   ↓
3. API Route (/api/data) → reads from localStorage
   ↓
4. Data stored in React Context
   ↓
5. Components access via useApp() hook
   ↓
6. User makes changes → updates context
   ↓
7. Context change triggers save → POST to API
   ↓
8. API Route saves to localStorage
   ↓
9. Done! ✅
```

### **Routing**

```
File Structure              →    URL Path
──────────────────────────────────────────────
/app/page.tsx               →    /
/app/customers/page.tsx     →    /customers
/app/customers/[id]/page.tsx →   /customers/123
/app/credits/page.tsx       →    /credits
/app/reports/page.tsx       →    /reports
/app/settings/page.tsx      →    /settings
/app/staff/page.tsx         →    /staff
```

### **State Management**

```typescript
// Global state via React Context
import { useApp } from '@/components/providers/AppProvider';

function MyComponent() {
  const { appState, setAppState, isLoading } = useApp();
  
  // Access data
  const customers = appState.customers;
  const credits = appState.credits;
  
  // Update data
  setAppState(prev => ({
    ...prev,
    customers: [...prev.customers, newCustomer]
  }));
}
```

## 🛠️ Development

### **Project Scripts**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### **Adding a New Page**

1. Create file in `/app`:
```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My new page!</div>;
}
```

2. Navigate to it:
```typescript
// Any component
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/my-page');
```

### **Adding a New API Endpoint**

1. Create route file:
```typescript
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: 'Hello!' });
}
```

2. Call from client:
```typescript
const response = await fetch('/api/my-endpoint');
const data = await response.json();
```

### **Using Global State**

```typescript
'use client';
import { useApp } from '@/components/providers/AppProvider';

export function MyComponent() {
  const { appState, setAppState } = useApp();
  
  // Read
  const customers = appState.customers;
  
  // Update
  const addCustomer = (customer) => {
    setAppState(prev => ({
      ...prev,
      customers: [...prev.customers, customer]
    }));
  };
}
```

## 🌐 Deployment

### **Vercel** (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Netlify**

```bash
# Build command
npm run build

# Publish directory
.next
```

### **Docker**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Documentation

- **[NEXTJS_MIGRATION.md](NEXTJS_MIGRATION.md)** - Migration guide from React SPA
- **[NEXTJS_STACK.md](NEXTJS_STACK.md)** - Complete tech stack overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
- **[API Documentation](/lib/api-client.ts)** - API functions

## 🎨 Features in Detail

### **Payment History Tracking**

Every payment is automatically recorded with:
- Payment amount
- Date and time
- Remaining balance after payment
- Optional note

Visible in:
1. **Dashboard** - Recent Payments table
2. **Customer Details** - Full payment timeline
3. **Credit Details Modal** - Credit-specific payments

### **Bulk Payment Feature**

- Pay multiple credits at once
- FIFO logic (oldest credits paid first)
- Automatic credit status update
- Full payment history recorded

### **Multi-Language Support**

```typescript
const translations = {
  en: { greeting: 'Hello' },
  am: { greeting: 'ሰላም' },
  om: { greeting: 'Coming Soon' }
};
```

Languages supported:
- ✅ English
- ✅ Amharic
- 🔄 Afan Oromo (Coming Soon)

### **Dark Mode**

- Automatic dark mode support
- Toggle in settings
- Persisted preference
- Tailwind dark: prefix

### **Number Formatting**

All amounts consistently formatted with commas:
```typescript
formatNumber(1234567) // "1,234,567"
```

## 🔒 Data Storage

### **Current: localStorage**
- Browser-based storage
- Key: `creditTrackerData`
- Instant, no server needed

### **Future: Real Backend**
Easy to migrate! Just update `/app/api/data/route.ts`:

```typescript
// OLD: localStorage
export async function GET() {
  const data = getAllData(); // reads from localStorage
  return NextResponse.json(data);
}

// NEW: Supabase example
export async function GET() {
  const { data } = await supabase.from('credits').select('*');
  return NextResponse.json(data);
}
```

Your component code stays the same! 🎉

## 🎯 Why Next.js?

### **Before (React SPA)**
- Manual routing
- No server-side rendering
- No built-in API
- Manual optimizations
- Complex deployment

### **After (Next.js)**
- ✅ Automatic routing
- ✅ Server + client rendering
- ✅ Built-in API routes
- ✅ Automatic optimizations
- ✅ One-click deployment

## 🐛 Troubleshooting

### **Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### **Port already in use**
```bash
# Change port
npm run dev -- -p 3001
```

### **Data not persisting**
- Check browser console for errors
- Verify localStorage is enabled
- Check API route is working: `curl http://localhost:3000/api/data`

### **TypeScript errors**
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## 🤝 Contributing

This is a template/boilerplate. Feel free to:
- Fork and customize
- Add new features
- Improve existing code
- Share with others

## 📝 License

This project is open source and available for personal and commercial use.

## 🎉 Credits

Built with:
- Next.js by Vercel
- React by Facebook
- Tailwind CSS by Tailwind Labs
- Lucide icons by Lucide

---

## 🚀 Get Started Now!

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and start tracking credits! 🎯

---

**Made with ❤️ using Next.js 14**
