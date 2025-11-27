# 🎯 Next.js Stack - Complete Overview

## 📊 Technology Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.0 | Styling |
| **Lucide React** | Latest | Icons |
| **jsPDF** | Latest | PDF generation |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | RESTful API endpoints |
| **localStorage** | Data persistence (temporary) |
| **React Context** | Global state management |

### **Architecture Patterns**
- **App Router** (Next.js 14)
- **Server Components** (default)
- **Client Components** (interactive parts)
- **API Routes** (backend)
- **Context API** (state management)
- **File-based routing** (automatic)

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Next.js App (Client)                   │    │
│  │                                                 │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │  Components (React)                     │  │    │
│  │  │  • Dashboard, Customers, Credits, etc. │  │    │
│  │  │                                         │  │    │
│  │  │  Uses: useApp() hook                   │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  │                    ↓ ↑                         │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │  AppProvider (React Context)            │  │    │
│  │  │  • Global state                         │  │    │
│  │  │  • customers, credits, settings, etc.  │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  │                    ↓ ↑                         │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │  API Client (/lib/api-client.ts)        │  │    │
│  │  │  • fetchAllData()                       │  │    │
│  │  │  • saveAllData()                        │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓ ↑                            │
│                   HTTP Requests                        │
│                    (fetch API)                         │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  API Routes (/app/api/*/route.ts)             │    │
│  │                                                 │    │
│  │  GET    /api/data  → Fetch all data           │    │
│  │  POST   /api/data  → Save all data            │    │
│  │  DELETE /api/data  → Clear all data           │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓ ↑                            │
│  ┌────────────────────────────────────────────────┐    │
│  │  Database Layer (/lib/database.ts)             │    │
│  │  • getAllData()                                │    │
│  │  • saveAllData()                               │    │
│  │  • clearAllData()                              │    │
│  └────────────────────────────────────────────────┘    │
│                         ↓ ↑                            │
│  ┌────────────────────────────────────────────────┐    │
│  │  localStorage (Browser Storage)                │    │
│  │  Key: 'creditTrackerData'                      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 📂 Complete File Structure

```
credit-tracker-nextjs/
│
├── /app                          # Next.js App Router
│   ├── layout.tsx                # Root layout (wraps all pages)
│   ├── page.tsx                  # Home page → Dashboard
│   ├── globals.css               # Global styles
│   │
│   ├── /api                      # API Routes (Backend)
│   │   └── /data
│   │       └── route.ts          # CRUD operations
│   │
│   ├── /customers                # Customer pages
│   │   ├── page.tsx              # List all customers
│   │   ├── /new
│   │   │   └── page.tsx          # Add new customer
│   │   └── /[id]
│   │       └── page.tsx          # Customer details (dynamic)
│   │
│   ├── /credits                  # Credit pages
│   │   ├── page.tsx              # All credits
│   │   └── /new
│   │       └── page.tsx          # Add new credit
│   │
│   ├── /reports
│   │   └── page.tsx              # Reports page
│   │
│   ├── /settings
│   │   └── page.tsx              # Settings page
│   │
│   └── /staff
│       └── page.tsx              # Staff management
│
├── /components                   # React components
│   ├── /providers
│   │   └── AppProvider.tsx       # Global state context
│   │
│   ├── /navigation
│   │   ├── TopNav.tsx            # Top navigation bar
│   │   └── BottomNav.tsx         # Bottom navigation bar
│   │
│   ├── /pages
│   │   └── DashboardClient.tsx   # Dashboard wrapper
│   │
│   └── ... (existing components)
│       ├── Dashboard.tsx
│       ├── Customers.tsx
│       ├── CustomerDetails.tsx
│       ├── AddCustomer.tsx
│       ├── AddCredit.tsx
│       ├── AllCredits.tsx
│       ├── Reports.tsx
│       ├── SettingsPage.tsx
│       ├── StaffManagement.tsx
│       ├── PaymentHistoryView.tsx
│       ├── RecordPaymentModal.tsx
│       ├── BulkPaymentModal.tsx
│       ├── CreditDetailsModal.tsx
│       └── DeleteConfirmationModal.tsx
│
├── /lib                          # Libraries & utilities
│   ├── database.ts               # Data layer with sample data
│   └── api-client.ts             # Client-side API functions
│
├── /types                        # TypeScript definitions
│   └── index.ts                  # All type definitions
│
├── /utils                        # Utility functions
│   └── formatNumber.ts           # Number formatting
│
├── /public                       # Static assets
│
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration
├── package.json                  # Dependencies
│
└── Documentation
    ├── NEXTJS_MIGRATION.md       # Migration guide
    ├── NEXTJS_STACK.md           # This file
    ├── ARCHITECTURE.md           # System architecture
    ├── QUICK_START.md            # Quick start guide
    └── README.md                 # Project overview
```

## 🔄 Data Flow Example

### **1. User Opens App**
```typescript
// app/layout.tsx
<AppProvider>
  {children}  // All pages wrapped
</AppProvider>
```

### **2. AppProvider Loads Data**
```typescript
// components/providers/AppProvider.tsx
useEffect(() => {
  const loadData = async () => {
    const data = await fetchAllData(); // ← Calls API
    setAppState(data);
  };
  loadData();
}, []);
```

### **3. API Client Fetches**
```typescript
// lib/api-client.ts
export async function fetchAllData() {
  const response = await fetch('/api/data');
  return response.json();
}
```

### **4. API Route Handles Request**
```typescript
// app/api/data/route.ts
export async function GET() {
  const data = getAllData(); // ← Reads from database
  return NextResponse.json(data);
}
```

### **5. Database Layer Returns Data**
```typescript
// lib/database.ts
export function getAllData() {
  const stored = localStorage.getItem('creditTrackerData');
  return stored ? JSON.parse(stored) : defaultData;
}
```

### **6. Component Uses Data**
```typescript
// components/pages/DashboardClient.tsx
const { appState } = useApp();
const customers = appState.customers; // ✅ Data available!
```

## 🎨 Component Types

### **Server Components** (Default)
```typescript
// app/page.tsx
// No 'use client' directive = Server Component
export default function HomePage() {
  return <DashboardClient />;
}
```
**Benefits:**
- Runs on server
- Smaller bundle size
- Can access server resources directly
- Better SEO

### **Client Components**
```typescript
// components/pages/DashboardClient.tsx
'use client'; // ← This makes it a Client Component

export function DashboardClient() {
  const { appState } = useApp(); // Can use hooks
  return <Dashboard {...props} />;
}
```
**Use when:**
- Need useState, useEffect, etc.
- Need browser APIs
- Need event handlers
- Need Context

## 🛣️ Routing

### **File-Based Routing**
```
/app/page.tsx              → /
/app/customers/page.tsx    → /customers
/app/customers/new/page.tsx → /customers/new
/app/customers/[id]/page.tsx → /customers/123 (dynamic)
/app/credits/page.tsx      → /credits
```

### **Programmatic Navigation**
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/customers');         // Navigate
router.push(`/customers/${id}`);   // With parameter
router.back();                     // Go back
```

### **Link Component**
```typescript
import Link from 'next/link';

<Link href="/customers">Customers</Link>
<Link href={`/customers/${id}`}>View Customer</Link>
```

## 🔌 API Routes

### **Structure**
```
/app/api/data/route.ts

Available HTTP methods:
- GET    → export async function GET()
- POST   → export async function POST(request)
- PUT    → export async function PUT(request)
- DELETE → export async function DELETE()
- PATCH  → export async function PATCH(request)
```

### **Example: CRUD Operations**
```typescript
// GET - Fetch data
export async function GET() {
  const data = getAllData();
  return NextResponse.json(data);
}

// POST - Create/Update data
export async function POST(request: NextRequest) {
  const body = await request.json();
  saveAllData(body);
  return NextResponse.json({ success: true });
}

// DELETE - Remove data
export async function DELETE() {
  clearAllData();
  return NextResponse.json({ success: true });
}
```

## 🎯 State Management

### **Global State (AppProvider)**
```typescript
// components/providers/AppProvider.tsx
const [appState, setAppState] = useState<AppState>({
  customers: [],
  credits: [],
  shopInfo: null,
  staff: [],
  settings: { theme: 'light', language: 'en', calendarType: 'gregorian' }
});
```

### **Access in Components**
```typescript
'use client';
import { useApp } from '@/components/providers/AppProvider';

export function MyComponent() {
  const { appState, setAppState, isLoading } = useApp();
  
  // Read
  const customers = appState.customers;
  
  // Update
  setAppState(prev => ({
    ...prev,
    customers: [...prev.customers, newCustomer]
  }));
}
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "jspdf": "latest"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

## 🚀 npm Scripts

```json
{
  "scripts": {
    "dev": "next dev",           // Start development server
    "build": "next build",       // Build for production
    "start": "next start",       // Start production server
    "lint": "next lint"          // Run ESLint
  }
}
```

## 🎨 Styling

### **Tailwind CSS v4.0**
- Utility-first CSS
- Dark mode support with `dark:` prefix
- Custom design tokens in `globals.css`
- Mobile-first responsive design

### **Global Styles**
```css
/* app/globals.css */
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  /* ... more variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... more variables */
}
```

## 🔒 Type Safety

### **TypeScript Configuration**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // ← Path alias for clean imports
    }
  }
}
```

### **Import Examples**
```typescript
// Clean imports with @/
import { Customer, Credit } from '@/types';
import { formatNumber } from '@/utils/formatNumber';
import { useApp } from '@/components/providers/AppProvider';
import { fetchAllData } from '@/lib/api-client';
```

## ⚡ Performance Optimizations

1. **Automatic Code Splitting**: Each page = separate bundle
2. **Image Optimization**: Built-in with `next/image`
3. **Font Optimization**: Built-in with `next/font`
4. **Static Generation**: Pages pre-rendered when possible
5. **Fast Refresh**: Instant feedback during development

## 🌐 Deployment Options

### **Vercel** (Recommended - Zero Config)
```bash
vercel
```

### **Netlify**
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📚 Learning Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **App Router Guide**: https://nextjs.org/docs/app
- **API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **React Context**: https://react.dev/learn/passing-data-deeply-with-context
- **TypeScript**: https://www.typescriptlang.org/docs/

## 🎯 Summary

### **What You Get with Next.js:**

✅ **Better Developer Experience**
- Fast refresh
- Better error messages
- TypeScript first-class support
- Automatic routing

✅ **Better Performance**
- Code splitting
- Optimized builds
- Image optimization
- Font optimization

✅ **Better Architecture**
- Clear separation of concerns
- Server + Client components
- Built-in API routes
- File-based routing

✅ **Better Scalability**
- Easy to add new pages
- Easy to add new API endpoints
- Modular component structure
- Type-safe codebase

✅ **Production Ready**
- One-click deployment
- SEO friendly
- Fast page loads
- Automatic optimizations

---

**Your Credit Tracker app is now built on a modern, scalable, production-ready stack!** 🚀
