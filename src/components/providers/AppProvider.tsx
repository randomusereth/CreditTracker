'use client';

/**
 * APP PROVIDER - Global State Management with Authentication
 * This component provides global state and authentication to all components
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppState, AppSettings } from '@/types';
import { User } from '@/types/auth';
import { fetchUserData, saveUserData } from '@/lib/api-client';
import { getCurrentUser, clearCurrentUser } from '@/lib/auth';

const initialSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  calendarType: 'gregorian',
};

const initialState: AppState = {
  customers: [],
  credits: [],
  shopInfo: null,
  staff: [],
  settings: initialSettings,
};

type AppContextType = {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isLoading: boolean;
  user: User | null;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsCheckingAuth(false);

    // Redirect to onboarding if not authenticated and not already there
    if (!currentUser && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [pathname, router]);

  // Load user data when authenticated
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserData(user.id);
        setAppState(data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Save data when it changes
  useEffect(() => {
    if (!user || isLoading) return;

    const saveData = async () => {
      try {
        await saveUserData(user.id, appState);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [appState, user, isLoading]);

  // Apply theme
  useEffect(() => {
    if (appState.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.settings.theme]);

  // Update settings helper function
  const updateSettings = (settings: Partial<AppSettings>) => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  // Logout function
  const logout = () => {
    clearCurrentUser();
    setUser(null);
    setAppState(initialState);
    router.push('/onboarding');
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ appState, setAppState, updateSettings, isLoading, user, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
