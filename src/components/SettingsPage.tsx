import { useState } from 'react';
import { Sun, Moon, Globe, Calendar, Store, MapPin, Phone, Mail, Save } from 'lucide-react';
import { AppSettings, ShopInfo } from '../App';

type SettingsPageProps = {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  shopInfo?: ShopInfo | null;
  onUpdateShopInfo?: (shopInfo: ShopInfo) => void;
};

export default function SettingsPage({ settings, onUpdateSettings, shopInfo, onUpdateShopInfo }: SettingsPageProps) {
  const [shopFormData, setShopFormData] = useState({
    name: shopInfo?.name || '',
    region: shopInfo?.region || '',
    city: shopInfo?.city || '',
    phone: shopInfo?.phone || '',
    email: shopInfo?.email || '',
  });
  const [shopSaved, setShopSaved] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'አማርኛ (Amharic)' },
    { code: 'om', name: 'Afaan Oromoo (Coming Soon)', disabled: true },
  ];

  const calendars = [
    { code: 'gregorian', name: 'Gregorian Calendar' },
    { code: 'ethiopian', name: 'Ethiopian Calendar' },
  ];

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateShopInfo) {
      onUpdateShopInfo(shopFormData);
      setShopSaved(true);
      setTimeout(() => setShopSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Customize your app preferences</p>
      </div>

      {/* Shop Profile Section */}
      {onUpdateShopInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-gray-900 dark:text-white">Shop Profile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your business information</p>
            </div>
          </div>
          
          <form onSubmit={handleShopSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm">
                <Store className="w-4 h-4" />
                Business Name *
              </label>
              <input
                type="text"
                required
                value={shopFormData.name}
                onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Enter your business name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  Region *
                </label>
                <input
                  type="text"
                  required
                  value={shopFormData.region}
                  onChange={(e) => setShopFormData({ ...shopFormData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g., Addis Ababa"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shopFormData.city}
                  onChange={(e) => setShopFormData({ ...shopFormData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="e.g., Bole"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm">
                <Phone className="w-4 h-4" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={shopFormData.phone}
                onChange={(e) => setShopFormData({ ...shopFormData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="+251..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm">
                <Mail className="w-4 h-4" />
                Email (Optional)
              </label>
              <input
                type="email"
                value={shopFormData.email}
                onChange={(e) => setShopFormData({ ...shopFormData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="business@email.com"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Shop Profile
              </button>
              {shopSaved && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span>✓ Saved successfully!</span>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Theme Setting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          {settings.theme === 'dark' ? (
            <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
          <div>
            <h3 className="text-gray-900 dark:text-white">Theme</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
              settings.theme === 'light'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Language Setting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-gray-900 dark:text-white">Language</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select your preferred language</p>
          </div>
        </div>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => !lang.disabled && onUpdateSettings({ language: lang.code as 'en' | 'am' | 'om' })}
              disabled={lang.disabled}
              className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all ${
                lang.disabled
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : settings.language === lang.code
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Setting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-gray-900 dark:text-white">Calendar Type</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose your calendar system</p>
          </div>
        </div>
        <div className="space-y-2">
          {calendars.map((calendar) => (
            <button
              key={calendar.code}
              onClick={() => onUpdateSettings({ calendarType: calendar.code as 'gregorian' | 'ethiopian' })}
              className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all ${
                settings.calendarType === calendar.code
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {calendar.name}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
          Note: Ethiopian calendar dates will be marked with (ET) indicator. Full conversion coming soon.
        </p>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-gray-900 dark:text-white mb-2">About Credit Tracker</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Version 1.0.0</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A comprehensive solution for managing customer credits and tracking payments.
        </p>
      </div>
    </div>
  );
}
