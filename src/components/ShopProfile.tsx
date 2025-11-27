import { useState, useEffect } from 'react';
import { ShopInfo } from '../App';
import { Store, MapPin, Phone, Save, AlertCircle } from 'lucide-react';
import { validateEthiopianPhone } from '../utils/phoneValidation';

// Ethiopian Regions and Cities Data
const ethiopianRegions: Record<string, string[]> = {
  'Addis Ababa': ['Addis Ababa', 'Bole', 'Megenagna', 'Cazanchise', 'Merkato', 'Piazza', 'Arat Kilo', 'Saris', 'CMC', 'Kality', 'Nifas Silk', 'Gurd Shola', 'Lideta', 'Kirkos', 'Arada', 'Yeka', 'Bole Sub-city', 'Nifas Silk-Lafto', 'Kolfe Keranio', 'Gulele', 'Arada Sub-city'],
  'Afar': ['Semera', 'Asaita', 'Dubti', 'Logiya', 'Awash', 'Gewane', 'Mille', 'Chifra', 'Elidar', 'Teru'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Kombolcha', 'Debre Markos', 'Debre Birhan', 'Woldiya', 'Kemise', 'Shire', 'Debre Tabor', 'Finote Selam', 'Injibara', 'Nekemte', 'Assosa', 'Gambela'],
  'Benishangul-Gumuz': ['Asosa', 'Assosa', 'Bambasi', 'Kurmuk', 'Menge', 'Sherkole', 'Tongo', 'Yaso'],
  'Dire Dawa': ['Dire Dawa', 'Melka Jebdu', 'Gurgura', 'Harawe'],
  'Gambela': ['Gambela', 'Itang', 'Pinyudo', 'Abobo', 'Gog', 'Jor', 'Lare', 'Wentawo'],
  'Harari': ['Harar', 'Dire Dawa', 'Aweday', 'Babile', 'Fedis'],
  'Oromia': ['Adama', 'Jimma', 'Bishoftu', 'Shashamane', 'Nazret', 'Ambo', 'Goba', 'Dembidolo', 'Nekemte', 'Gimbi', 'Shambu', 'Bale Robe', 'Ginir', 'Dodola', 'Asella', 'Batu', 'Ziway', 'Mojo', 'Sebeta', 'Holeta', 'Woliso', 'Welkite', 'Butajira', 'Worabe', 'Hossana', 'Wolaita Sodo', 'Arba Minch', 'Jinka', 'Konso', 'Turmi'],
  'SNNPR': ['Hawassa', 'Arba Minch', 'Dilla', 'Sodo', 'Wolaita Sodo', 'Hossana', 'Butajira', 'Worabe', 'Shashemene', 'Yirgalem', 'Dila', 'Yabello', 'Moyale', 'Konso', 'Jinka', 'Turmi', 'Kibish', 'Mizan Teferi', 'Bonga', 'Tepi', 'Masha', 'Gore', 'Gambela'],
  'Somali': ['Jijiga', 'Gode', 'Kebri Dehar', 'Degehabur', 'Shilabo', 'Warder', 'Kebri Beyah', 'Fik', 'Imi', 'Kelafo', 'Mustahil', 'Ferfer', 'Danan', 'Shinile', 'Aysha', 'Erer', 'Gursum', 'Babile', 'Harshin', 'Kebri Beyah'],
  'Tigray': ['Mekelle', 'Adigrat', 'Axum', 'Shire', 'Humera', 'Adwa', 'Wukro', 'Alamata', 'Korem', 'Maychew', 'Abiy Adi', 'Endaselassie', 'Sheraro', 'Zalambessa', 'Edaga Hamus', 'Hagere Selam', 'Adet', 'Debre Damo', 'Yeha'],
};

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
  });
  const [saved, setSaved] = useState(false);

  // Get cities for selected region
  const availableCities = formData.region ? (ethiopianRegions[formData.region] || []) : [];

  useEffect(() => {
    if (shopInfo) {
      setFormData({
        name: shopInfo.name || '',
        region: shopInfo.region || '',
        city: shopInfo.city || '',
        phone: shopInfo.phone || '',
      });
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
              Business Name
            </label>
            <input
              type="text"
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
                Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => {
                  setFormData({ ...formData, region: e.target.value, city: '' });
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Select Region</option>
                {Object.keys(ethiopianRegions).map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                City
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.region}
              >
                <option value="">{formData.region ? 'Select City' : 'Select Region first'}</option>
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, phone: value });
                if (phoneError) {
                  const validation = validateEthiopianPhone(value);
                  if (validation.isValid) {
                    setPhoneError(null);
                  } else {
                    setPhoneError(validation.error || null);
                  }
                }
              }}
              onBlur={() => {
                if (formData.phone) {
                  const validation = validateEthiopianPhone(formData.phone);
                  if (!validation.isValid) {
                    setPhoneError(validation.error || null);
                  }
                }
              }}
              className={`w-full px-4 py-2 border ${phoneError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
              placeholder="+251912345678 or 0912345678"
            />
            {phoneError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{phoneError}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Only Ethiopian phone numbers allowed (+251 or 0...)
            </p>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopProfile;
