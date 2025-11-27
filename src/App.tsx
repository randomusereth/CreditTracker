/**
 * MAIN APP ENTRY POINT
 * Credit Tracker with Telegram Authentication
 * This works in both Figma Make preview and standalone environments
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { CreditCard, Settings, Home, Users, FileText, UserCog, Plus, LogOut, User as UserIcon } from 'lucide-react';
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
import { getCurrentUser, saveCurrentUser, createUser, clearCurrentUser, validatePhoneNumber, validateTelegramId } from './lib/auth';
import { getUserData, saveUserData } from './lib/database';
import { Phone, Send, AlertCircle } from 'lucide-react';

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
function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; telegram?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: { phone?: string; telegram?: string } = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!telegramId.trim()) {
      newErrors.telegram = 'Telegram ID is required';
    } else if (!validateTelegramId(telegramId)) {
      newErrors.telegram = 'Telegram ID should be 5-32 alphanumeric characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = await createUser(phoneNumber.trim(), telegramId.trim());
      saveCurrentUser(user);
      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (error) {
      setErrors({ phone: 'Failed to create account. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Welcome to Credit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account to get started
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-400">Step 1 of 2: Account Setup</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Telegram Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                    errors.phone
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.phone}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter your phone number with country code (e.g., +251912345678)
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Telegram ID (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Send className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="@yourusername"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                    errors.telegram
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.telegram && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.telegram}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Your Telegram username without @ symbol
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    This information will be used for payment reminders and notifications via Telegram.
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Your data is stored locally on your device and is completely private.
        </p>
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
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Set Up Your Shop Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us about your business
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">Step 2 of 2: Shop Details</span>
          </div>
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
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                  errors.shopName
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
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                  errors.region
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
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                  errors.city
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
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                  errors.phone
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
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    setAppState({
      customers: [],
      credits: [],
      shopInfo: null,
      staff: [],
      settings: initialSettings,
    });
  };

  const handleOnboardingComplete = async () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      try {
        const data = await getUserData(currentUser.id);
        setAppState(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  };

  const handleShopProfileSetupComplete = (shopInfo: ShopInfo) => {
    setAppState(prev => ({
      ...prev,
      shopInfo,
    }));
  };

  // If not authenticated, show onboarding
  if (!user) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  // If authenticated but no shop profile, show shop setup
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
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-gray-900 dark:text-white">{appState.shopInfo?.name || 'My Shop'}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{appState.shopInfo?.city}, {appState.shopInfo?.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateTo('settings')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm">@{user.telegramId}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
                        <p className="text-gray-900 dark:text-white">@{user.telegramId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.phoneNumber}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => navigateTo('customers')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'customers' || currentView === 'add-customer' || currentView === 'customer-details'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Customers</span>
              </button>
              <button
                onClick={() => navigateTo('all-credits')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'all-credits'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Credits</span>
              </button>
              <button
                onClick={() => navigateTo('reports')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'reports'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">Reports</span>
              </button>
              <button
                onClick={() => navigateTo('staff')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'staff'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <UserCog className="w-5 h-5" />
                <span className="text-xs">Staff</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </AppContext.Provider>
  );
}

export default App;