import { useState, useEffect } from 'react';
import { ShopInfo } from '../App';
import { Store, MapPin, Phone, Mail, Save } from 'lucide-react';

interface ShopProfileProps {
  shopInfo: ShopInfo | null;
  onUpdateShopInfo: (shopInfo: ShopInfo) => void;
}

export function ShopProfile({ shopInfo, onUpdateShopInfo }: ShopProfileProps) {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    city: '',
    phone: '',
    email: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (shopInfo) {
      setFormData(shopInfo);
    }
  }, [shopInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShopInfo(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-gray-900 dark:text-white">Shop Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your business information
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Store className="w-4 h-4" />
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Enter your business name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                Region *
              </label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g., Addis Ababa"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g., Bole"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="+251..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="business@email.com"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span>✓ Saved successfully!</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Info Card */}
      {shopInfo && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-blue-900 dark:text-blue-100 mb-4">Business Profile</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-700 dark:text-blue-300">{shopInfo.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-700 dark:text-blue-300">
                  {shopInfo.city}, {shopInfo.region}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-700 dark:text-blue-300">{shopInfo.phone}</p>
              </div>
            </div>
            {shopInfo.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-700 dark:text-blue-300">{shopInfo.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopProfile;
