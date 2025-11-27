# Remove Development Mode Before Deployment

## What to Remove

When ready for production deployment, remove the console prompt fallback:

### 1. Remove from `src/lib/auth.ts`:
- Delete the `promptTelegramIdFromConsole()` function (lines ~53-86)

### 2. Remove from `src/App.tsx`:
- Remove the import: `promptTelegramIdFromConsole` from the auth import
- In the `useEffect` in `PasswordAuth` component, remove the else block that calls `promptTelegramIdFromConsole()`
- Keep only the Telegram initData check

### Quick Find/Replace:

**In `src/lib/auth.ts`:**
- Delete the entire `promptTelegramIdFromConsole` function

**In `src/App.tsx`:**
- Remove `promptTelegramIdFromConsole` from imports
- Replace the `initializeAuth` function's else block with:
```typescript
} else {
  setErrors({ general: 'This app must be opened from Telegram' });
}
```

## After Removal

The app will only work when opened from Telegram Mini App, which is the intended behavior for production.

