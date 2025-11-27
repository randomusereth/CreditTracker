# Clear Storage to See Step 1 Again

## Quick Fix

You have a user saved in localStorage from a previous session. To see Step 1 (Telegram ID & Phone) again:

### Option 1: Browser Console (Recommended)

1. Open your browser's Developer Console:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

2. Go to the **Console** tab

3. Type this command and press Enter:
   ```javascript
   localStorage.clear(); location.reload();
   ```

4. The page will reload and you'll see Step 1 again!

### Option 2: Application Tab

1. Open Developer Tools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:3000` (or your URL)
4. Right-click and select **Clear** or delete the `creditTracker_currentUser` key
5. Refresh the page

## Why This Happens

The app checks for a saved user in localStorage:
- **If user exists** → Skip Step 1, go to Step 2 (Shop Profile)
- **If no user** → Show Step 1 (Telegram ID & Phone)

Since you have a user saved, it's skipping Step 1.

## After Clearing

You'll see:
1. **Step 1**: Enter Telegram ID and Phone Number
2. **Step 2**: Set up Shop Profile
3. **Dashboard**: Start using the app

## For Production

In production, users will naturally see Step 1 first since they won't have a saved user yet.

