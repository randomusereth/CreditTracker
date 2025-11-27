# 🚀 Next.js Setup Instructions

## Step-by-Step Guide to Run Your Credit Tracker

### ⚡ Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000

# 4. Done! 🎉
```

---

## 📋 Detailed Setup

### **Step 1: Prerequisites**

Make sure you have installed:
- **Node.js** 18 or higher
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check: `npm --version`

### **Step 2: Install Dependencies**

```bash
npm install
```

This installs:
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 4.0
- Lucide React (icons)
- jsPDF (PDF generation)

**Expected output:**
```
added 250 packages in 30s
```

### **Step 3: Run Development Server**

```bash
npm run dev
```

**Expected output:**
```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.5s
```

### **Step 4: Open in Browser**

Visit: **http://localhost:3000**

You should see the **Dashboard** page! 🎉

---

## 🎯 Verify Everything Works

### **1. Check Dashboard**
- ✅ See stats cards (Total Credits, Paid, Unpaid, Customers)
- ✅ See Recent Credits table
- ✅ See Recent Payments table

### **2. Check Navigation**
Click bottom navigation:
- ✅ Home (Dashboard)
- ✅ Customers (should show error - not migrated yet)
- ✅ Credits (should show error - not migrated yet)
- ✅ Reports (should show error - not migrated yet)
- ✅ Staff (should show error - not migrated yet)

### **3. Check API**
Open browser console (F12) and run:
```javascript
fetch('/api/data').then(r => r.json()).then(console.log)
```

You should see all your data! ✅

---

## 🔧 Troubleshooting

### **Problem: Port 3000 already in use**

**Solution 1:** Kill the process using port 3000
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Solution 2:** Use different port
```bash
npm run dev -- -p 3001
```

---

### **Problem: Module not found**

```
Error: Cannot find module '@/types'
```

**Solution:** Clear cache and reinstall
```bash
rm -rf node_modules .next
npm install
npm run dev
```

---

### **Problem: TypeScript errors**

```
Type error: Cannot find module '@/types' or its corresponding type declarations
```

**Solution:** Restart TypeScript server
1. In VS Code: `Cmd/Ctrl + Shift + P`
2. Type: "TypeScript: Restart TS Server"
3. Press Enter

---

### **Problem: Page shows 404**

**Solution:** Make sure you're accessing the right URL
- ✅ http://localhost:3000 (Dashboard)
- ❌ http://localhost:3000/customers (Not migrated yet)

---

### **Problem: Data not loading**

**Solution:** Check browser console
1. Press F12
2. Go to Console tab
3. Look for errors
4. Check Application → Local Storage → creditTrackerData

---

## 📂 Project Structure Check

Verify these files exist:

```
✅ /app/layout.tsx
✅ /app/page.tsx
✅ /app/globals.css
✅ /app/api/data/route.ts
✅ /components/providers/AppProvider.tsx
✅ /components/navigation/TopNav.tsx
✅ /components/navigation/BottomNav.tsx
✅ /components/pages/DashboardClient.tsx
✅ /lib/database.ts
✅ /lib/api-client.ts
✅ /types/index.ts
✅ /utils/formatNumber.ts
✅ package.json
✅ tsconfig.json
✅ next.config.js
```

---

## 🎨 Development Workflow

### **Making Changes**

1. **Edit any file** (e.g., `components/Dashboard.tsx`)
2. **Save** (`Cmd/Ctrl + S`)
3. **See changes instantly** (Fast Refresh) ⚡

### **Adding a New Page**

```typescript
// 1. Create: app/my-page/page.tsx
export default function MyPage() {
  return <div>Hello from my page!</div>;
}

// 2. Visit: http://localhost:3000/my-page
// 3. Done! ✅
```

### **Adding New Component**

```typescript
// 1. Create: components/MyComponent.tsx
'use client';
export function MyComponent() {
  return <div>My Component</div>;
}

// 2. Use it:
import { MyComponent } from '@/components/MyComponent';
<MyComponent />
```

---

## 🚢 Building for Production

### **Build the app**

```bash
npm run build
```

**Expected output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         90 kB
├ ○ /api/data                            0 B            0 B
└ ○ /_not-found                          871 B         85.9 kB

○  (Static)  automatically rendered as static HTML
```

### **Start production server**

```bash
npm start
```

Visit: http://localhost:3000

---

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended) - FREE**

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repo
5. Click "Deploy"
6. Done! ✅

**Your app will be live at:** `your-app.vercel.app`

---

### **Option 2: Netlify - FREE**

1. Push code to GitHub
2. Go to https://netlify.com
3. Click "New site from Git"
4. Select your repo
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Click "Deploy"
8. Done! ✅

---

### **Option 3: Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t credit-tracker .

# Run container
docker run -p 3000:3000 credit-tracker
```

---

## 📊 What's Currently Working

### ✅ **Fully Migrated**
- [x] Project structure
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Global state (Context API)
- [x] API routes (`/api/data`)
- [x] Top navigation
- [x] Bottom navigation
- [x] Dashboard page
- [x] Dashboard component
- [x] Type definitions
- [x] Database layer
- [x] API client functions
- [x] Number formatting utility

### 🔄 **Needs Migration**
- [ ] Customers page
- [ ] Customer details page
- [ ] Add customer page
- [ ] All credits page
- [ ] Add credit page
- [ ] Reports page
- [ ] Settings page
- [ ] Staff management page

### 🎯 **Next Steps for You**

1. **Test the Dashboard** - Make sure everything works
2. **Migrate remaining pages** - Follow the pattern
3. **Update components** - Change imports to use `@/`
4. **Test all features** - Ensure functionality works
5. **Deploy!** - Ship to production

---

## 📚 Documentation

### **For Developers**
- **[NEXTJS_MIGRATION.md](NEXTJS_MIGRATION.md)** - How the migration works
- **[NEXTJS_STACK.md](NEXTJS_STACK.md)** - Tech stack details
- **[COMPARISON.md](COMPARISON.md)** - React SPA vs Next.js
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture

### **For Quick Reference**
- **[README_NEXTJS.md](README_NEXTJS.md)** - Project overview
- **[QUICK_START.md](QUICK_START.md)** - Quick commands

---

## 💡 Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run dev -- -p 3001     # Start on different port

# Production
npm run build              # Build for production
npm start                  # Run production server

# Maintenance
npm run lint               # Run ESLint
rm -rf .next               # Clear Next.js cache
rm -rf node_modules        # Clear dependencies
npm install                # Reinstall dependencies

# Deployment
vercel                     # Deploy to Vercel
netlify deploy             # Deploy to Netlify
```

---

## 🎓 Learning Resources

### **Next.js**
- Official Docs: https://nextjs.org/docs
- Tutorial: https://nextjs.org/learn
- Examples: https://github.com/vercel/next.js/tree/canary/examples

### **React**
- Official Docs: https://react.dev
- Hooks: https://react.dev/reference/react

### **TypeScript**
- Official Docs: https://www.typescriptlang.org/docs
- Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

### **Tailwind CSS**
- Official Docs: https://tailwindcss.com/docs
- Cheat Sheet: https://nerdcave.com/tailwind-cheat-sheet

---

## ✅ Success Checklist

Before considering setup complete:

- [ ] `npm install` ran successfully
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 shows Dashboard
- [ ] Dashboard shows sample data
- [ ] Navigation bar is visible
- [ ] Browser console has no errors
- [ ] Dark mode toggle works (in settings)
- [ ] API endpoint works (`/api/data`)
- [ ] Can see data in localStorage

---

## 🎉 You're All Set!

If all checks pass, you're ready to start developing!

### **What to do next:**

1. ✅ Explore the Dashboard
2. ✅ Check the sample data
3. ✅ Read the documentation
4. ✅ Start migrating remaining pages
5. ✅ Build amazing features!

---

## 🆘 Need Help?

### **Common Issues:**
- Check `/TROUBLESHOOTING.md` (if exists)
- Check browser console for errors
- Check terminal for errors
- Google the error message
- Check Next.js docs

### **Still Stuck?**
- Review `/NEXTJS_MIGRATION.md`
- Check `/NEXTJS_STACK.md` for architecture
- Look at working Dashboard implementation
- Compare with original React SPA code

---

**Happy Coding!** 🚀
