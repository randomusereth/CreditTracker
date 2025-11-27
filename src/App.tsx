/**
 * MAIN APP ENTRY POINT
 * Credit Tracker with Telegram Authentication
 * This works in both Figma Make preview and standalone environments
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { CreditCard, Settings, Home, Users, FileText, UserCog, Plus, LogOut, User as UserIcon, Wallet, Store } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Customers } from './components/Customers';
import AddCustomer from './components/AddCustomer';
import { CustomerDetails } from './components/CustomerDetails';
import AddCredit from './components/AddCredit';
import { Reports } from './components/Reports';
import SettingsPage from './components/SettingsPage';
import { ShopProfile } from './components/ShopProfile';
import { StaffManagement } from './components/StaffManagement';
import { AllCredits } from './components/AllCredits';
import { Customer, Credit, ShopInfo, Staff, AppSettings, AppState } from './types';
import { User } from './types/auth';
import { getCurrentUser, saveCurrentUser, clearCurrentUser, createUserWithPassword, authenticateUser, userExists, validatePassword, getTelegramUserId } from './lib/auth';
import { getTelegramUser } from './lib/telegram-debug';
import { getUserData, saveUserData } from './lib/database';
import { Send, AlertCircle, Lock } from 'lucide-react';

// Context for app state
type AppContextType = {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  user: User | null;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

const initialSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  calendarType: 'gregorian',
};

// Onboarding Component
// Password Authentication Component
function PasswordAuth({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const initializeAuth = async () => {
      // Wait a bit for Telegram to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get Telegram user ID from initData
      const tgUser = getTelegramUser();
      if (tgUser && tgUser.id) {
        const id = tgUser.id.toString();
        setTelegramId(id);
        setUserName(tgUser.first_name || 'User');

        // Check if user already exists
        userExists(id).then(exists => {
          setIsCreating(!exists);
        });
      } else {
        // Telegram ID not found - user must open app from Telegram
        setErrors({ general: 'Telegram ID not found. Please open this app from Telegram to continue.' });
      }
    };

    initializeAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!telegramId) {
      setErrors({ general: 'Telegram ID not found. Please open this app from Telegram.' });
      return;
    }

    if (isCreating) {
      // Creating new account
      if (!password.trim()) {
        setErrors({ password: 'Password is required' });
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setErrors({ password: passwordValidation.error });
        return;
      }

      if (password !== confirmPassword) {
        setErrors({ confirm: 'Passwords do not match' });
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await createUserWithPassword(telegramId, password);
        saveCurrentUser(user);
        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (error) {
        setErrors({ general: 'Failed to create account. Please try again.' });
        setIsSubmitting(false);
      }
    } else {
      // Logging in
      if (!password.trim()) {
        setErrors({ password: 'Password is required' });
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await authenticateUser(telegramId, password);
        if (user) {
          saveCurrentUser(user);
          setTimeout(() => {
            onComplete();
          }, 500);
        } else {
          setErrors({ password: 'Incorrect password' });
          setIsSubmitting(false);
        }
      } catch (error) {
        setErrors({ general: 'Failed to authenticate. Please try again.' });
        setIsSubmitting(false);
      }
    }
  };

  if (!telegramId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-gray-900 dark:text-white mb-2">Telegram Required</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please open this app from Telegram to continue.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This application requires Telegram authentication to work properly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            {isCreating ? 'Create Your Password' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isCreating
              ? `Hello ${userName}! Create a password to secure your account`
              : `Hello ${userName}! Enter your password to continue`
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isCreating ? "Create a password" : "Enter your password"}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.password
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.password}</span>
                </div>
              )}
              {isCreating && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {isCreating && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.confirm
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.confirm && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.confirm}</span>
                  </div>
                )}
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-100">
                    {errors.general}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isCreating ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{isCreating ? 'Create Account' : 'Sign In'}</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Shop Profile Setup Component
function ShopProfileSetup({ onComplete }: { onComplete: (shopInfo: ShopInfo) => void }) {
  const [shopName, setShopName] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ shopName?: string; region?: string; city?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { shopName?: string; region?: string; city?: string; phone?: string } = {};

    if (!shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const shopInfo: ShopInfo = {
      name: shopName.trim(),
      region: region.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    };

    setTimeout(() => {
      onComplete(shopInfo);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Set Up Your Shop Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us about your business
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Shop/Business Name *
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g., Ahmed's Electronics"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.shopName
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                disabled={isSubmitting}
              />
              {errors.shopName && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.shopName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Region/State *
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., Addis Ababa"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.region
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                disabled={isSubmitting}
              />
              {errors.region && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.region}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Bole"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.city
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                disabled={isSubmitting}
              />
              {errors.city && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.city}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Shop Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251912345678"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.phone
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shop@example.com"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                disabled={isSubmitting}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    This information will appear on reports and can be updated later in settings.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Setting Up...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup</span>
                  <CreditCard className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>({
    customers: [],
    credits: [],
    shopInfo: null,
    staff: [],
    settings: initialSettings,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'customers' | 'add-customer' | 'customer-details' | 'add-credit' | 'all-credits' | 'reports' | 'settings' | 'shop-profile' | 'staff'>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        try {
          // Load user data
          const data = await getUserData(currentUser.id);
          setAppState(data);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

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

  const logout = () => {
    clearCurrentUser();
    setUser(null);
    // Don't clear appState - it will be reloaded when user logs back in
    // This preserves the data in Supabase/localStorage
  };

  const handleOnboardingComplete = async () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      try {
        setIsLoading(true);
        // Load user data from database
        const data = await getUserData(currentUser.id);
        setAppState(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleShopProfileSetupComplete = (shopInfo: ShopInfo) => {
    setAppState(prev => ({
      ...prev,
      shopInfo,
    }));
  };

  // If not authenticated, show password authentication
  if (!user) {
    return <PasswordAuth onComplete={handleOnboardingComplete} />;
  }

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but no shop profile (new user only), show shop setup
  // This check happens after data is loaded, so returning users with shop info will go to dashboard
  if (!appState.shopInfo) {
    return <ShopProfileSetup onComplete={handleShopProfileSetupComplete} />;
  }

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAppState(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
    }));
  };

  const updateCustomer = (customer: Customer) => {
    setAppState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === customer.id ? customer : c),
    }));
  };

  const deleteCustomer = (id: string) => {
    setAppState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      credits: prev.credits.filter(c => c.customerId !== id),
    }));
  };

  const addCredit = (credit: Omit<Credit, 'id' | 'date' | 'status' | 'paymentHistory'>) => {
    const remainingAmount = credit.totalAmount - credit.paidAmount;
    let status: 'paid' | 'unpaid' | 'partially-paid' = 'unpaid';
    if (credit.paidAmount >= credit.totalAmount) {
      status = 'paid';
    } else if (credit.paidAmount > 0) {
      status = 'partially-paid';
    }

    const paymentHistory = credit.paidAmount > 0 ? [{
      id: Date.now().toString(),
      amount: credit.paidAmount,
      date: new Date().toISOString(),
      remainingAfterPayment: remainingAmount,
      note: 'Initial payment'
    }] : [];

    const newCredit: Credit = {
      ...credit,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      remainingAmount,
      status,
      paymentHistory,
    };
    setAppState(prev => ({
      ...prev,
      credits: [...prev.credits, newCredit],
    }));
  };

  const updateCredit = (credit: Credit) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => c.id === credit.id ? credit : c),
    }));
  };

  const deleteCredit = (id: string) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.filter(c => c.id !== id),
    }));
  };

  const changeCustomer = (creditId: string, newCustomerId: string) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => c.id === creditId ? { ...c, customerId: newCustomerId } : c),
    }));
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  const updateShopInfo = (shopInfo: ShopInfo) => {
    setAppState(prev => ({
      ...prev,
      shopInfo,
    }));
  };

  const addStaff = (staff: Omit<Staff, 'id'>) => {
    if (appState.staff.length >= 3) {
      alert('Maximum 3 staff members allowed');
      return;
    }
    const newStaff: Staff = {
      ...staff,
      id: Date.now().toString(),
    };
    setAppState(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff],
    }));
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setAppState(prev => ({
      ...prev,
      staff: prev.staff.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteStaff = (id: string) => {
    setAppState(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== id),
    }));
  };

  const navigateTo = (view: typeof currentView, customerId?: string) => {
    setCurrentView(view);
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            customers={appState.customers}
            credits={appState.credits}
            onAddCredit={() => navigateTo('add-credit')}
            onViewCustomer={(id) => navigateTo('customer-details', id)}
            settings={appState.settings}
            onUpdateCredit={updateCredit}
            onChangeCustomer={changeCustomer}
            onNavigateToCustomer={(id) => navigateTo('customer-details', id)}
          />
        );
      case 'customers':
        return (
          <Customers
            customers={appState.customers}
            credits={appState.credits}
            onAddCustomer={() => navigateTo('add-customer')}
            onViewCustomer={(id) => navigateTo('customer-details', id)}
            settings={appState.settings}
          />
        );
      case 'add-customer':
        return (
          <AddCustomer
            onAddCustomer={(customer) => {
              addCustomer(customer);
              navigateTo('customers');
            }}
            onCancel={() => navigateTo('customers')}
          />
        );
      case 'customer-details':
        return selectedCustomerId ? (
          <CustomerDetails
            customer={appState.customers.find(c => c.id === selectedCustomerId)!}
            credits={appState.credits.filter(c => c.customerId === selectedCustomerId)}
            onBack={() => navigateTo('customers')}
            onAddCredit={() => navigateTo('add-credit', selectedCustomerId)}
            settings={appState.settings}
            onUpdateCustomer={updateCustomer}
            onDeleteCustomer={deleteCustomer}
            onUpdateCredit={updateCredit}
            onDeleteCredit={deleteCredit}
            allCustomers={appState.customers}
            onChangeCustomer={changeCustomer}
          />
        ) : null;
      case 'add-credit':
        return (
          <AddCredit
            customers={appState.customers}
            preselectedCustomerId={selectedCustomerId}
            onAddCredit={(credit) => {
              addCredit(credit);
              navigateTo('dashboard');
            }}
            onCancel={() => navigateTo('dashboard')}
            onAddCustomer={(customer) => {
              const newCustomer: Customer = {
                ...customer,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
              };
              setAppState(prev => ({
                ...prev,
                customers: [...prev.customers, newCustomer],
              }));
              return newCustomer.id;
            }}
          />
        );
      case 'all-credits':
        return (
          <AllCredits
            credits={appState.credits}
            customers={appState.customers}
            settings={appState.settings}
            onUpdateCredit={updateCredit}
            onChangeCustomer={changeCustomer}
            onNavigateToCustomer={(customerId) => navigateTo('customer-details', customerId)}
          />
        );
      case 'reports':
        return (
          <Reports
            credits={appState.credits}
            customers={appState.customers}
            settings={appState.settings}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={appState.settings}
            onUpdateSettings={updateSettings}
            shopInfo={appState.shopInfo}
            onUpdateShopInfo={updateShopInfo}
            user={user}
            onLogout={logout}
          />
        );
      case 'shop-profile':
        return (
          <ShopProfile
            shopInfo={appState.shopInfo}
            onUpdateShopInfo={updateShopInfo}
          />
        );
      case 'staff':
        return (
          <StaffManagement
            staff={appState.staff}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onDeleteStaff={deleteStaff}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppContext.Provider value={{ appState, setAppState, user, logout }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Top Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-gray-900 dark:text-white text-lg font-semibold">Dube Tracker</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateTo('settings')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          {renderView()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'dashboard'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => navigateTo('customers')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'customers' || currentView === 'add-customer' || currentView === 'customer-details'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Customers</span>
              </button>
              <button
                onClick={() => navigateTo('all-credits')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'all-credits'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Credits</span>
              </button>
              <button
                onClick={() => navigateTo('reports')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'reports'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Reports</span>
              </button>
              {/* Staff button - hidden for now, uncomment to show */}
              {/* <button
                onClick={() => navigateTo('staff')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'staff'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <UserCog className="w-5 h-5" />
                <span className="text-xs">Staff</span>
              </button> */}
            </div>
          </div>
        </nav>

      </div>
    </AppContext.Provider>
  );
}

export default App;