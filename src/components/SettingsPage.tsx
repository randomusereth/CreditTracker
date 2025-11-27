import { useState } from 'react';
import { Sun, Moon, Globe, Calendar, Store, MapPin, Phone, Mail, Save, Lock, X, Eye, EyeOff, LogOut } from 'lucide-react';
import { AppSettings, ShopInfo } from '../App';
import { changePassword } from '../lib/auth';
import { User } from '../types/auth';

type SettingsPageProps = {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  shopInfo?: ShopInfo | null;
  onUpdateShopInfo?: (shopInfo: ShopInfo) => void;
  user?: User | null;
  onLogout?: () => void;
};

export default function SettingsPage({ settings, onUpdateSettings, shopInfo, onUpdateShopInfo, user, onLogout }: SettingsPageProps) {
  const [shopFormData, setShopFormData] = useState({
    name: shopInfo?.name || '',
    region: shopInfo?.region || '',
    city: shopInfo?.city || '',
    phone: shopInfo?.phone || '',
    email: shopInfo?.email || '',
  });
  const [shopSaved, setShopSaved] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!user || !user.telegramId) {
      setPasswordError('User not found');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword(user.telegramId, currentPassword, newPassword);
      if (result.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordSuccess(false);
        }, 2000);
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
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
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${settings.theme === 'light'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            <Sun className="w-5 h-5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${settings.theme === 'dark'
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
              className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all ${lang.disabled
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

      {/* Change Password Setting */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-gray-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
            </div>
          </div>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
        </div>
      )}

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
              className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all ${settings.calendarType === calendar.code
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

      {/* Logout Section */}
      {onLogout && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-gray-900 dark:text-white">Account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sign out of your account</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-lg border-2 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {/* About Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-gray-900 dark:text-white mb-2">About Credit Tracker</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Version 1.0.0</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A comprehensive solution for managing customer credits and tracking payments.
        </p>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Change Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {passwordError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </div>
              )}

              {/* Success Message */}
              {passwordSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-600 dark:text-green-400">
                  Password changed successfully!
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
