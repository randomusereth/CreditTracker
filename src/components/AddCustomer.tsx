import { useState } from 'react';
import { ArrowLeft, User, Phone, AlertCircle } from 'lucide-react';
import { Customer } from '../App';
import { AppSettings } from '../types';
import { validateEthiopianPhone } from '../utils/phoneValidation';

const translations: Record<string, Record<string, string>> = {
  en: {
    addNewCustomer: 'Add New Customer',
    enterCustomerDetails: 'Enter customer details',
    customerName: 'Customer Name *',
    phoneNumber: 'Phone Number *',
    enterCustomerName: 'Enter customer name',
    phonePlaceholder: '+251912345678 or 0912345678',
    phoneValidationMessage: 'Only Ethiopian phone numbers allowed (+251 or 0...)',
    fillAllFields: 'Please fill in all fields',
    invalidPhone: 'Invalid phone number',
    cancel: 'Cancel',
    addCustomer: 'Add Customer',
  },
  am: {
    addNewCustomer: 'አዲስ ደንበኛ ጨምር',
    enterCustomerDetails: 'የደንበኛ ዝርዝሮች ያስገቡ',
    customerName: 'የደንበኛ ስም *',
    phoneNumber: 'ስልክ ቁጥር *',
    enterCustomerName: 'የደንበኛ ስም ያስገቡ',
    phonePlaceholder: '+251912345678 ወይም 0912345678',
    phoneValidationMessage: 'የኢትዮጵያ ስልክ ቁጥሮች ብቻ ይፈቀዳሉ (+251 ወይም 0...)',
    fillAllFields: 'እባክዎ ሁሉንም መስኮች ይሙሉ',
    invalidPhone: 'ትክክለኛ ያልሆነ ስልክ ቁጥር',
    cancel: 'ሰርዝ',
    addCustomer: 'ደንበኛ ጨምር',
  },
};

type AddCustomerProps = {
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  settings: AppSettings;
};

export default function AddCustomer({ onAddCustomer, onCancel, settings }: AddCustomerProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (phoneError) {
      const validation = validateEthiopianPhone(value);
      if (validation.isValid) {
        setPhoneError(null);
      } else {
        setPhoneError(validation.error || null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(t('fillAllFields'));
      return;
    }

    // Validate phone number
    const phoneValidation = validateEthiopianPhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || t('invalidPhone'));
      return;
    }

    setPhoneError(null);
    onAddCustomer({ name: name.trim(), phone: phone.trim() });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-gray-900 dark:text-white">{t('addNewCustomer')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('enterCustomerDetails')}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('customerName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('enterCustomerName')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('phoneNumber')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border ${
                  phoneError ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            {phoneError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{phoneError}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('phoneValidationMessage')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('addCustomer')}
          </button>
        </div>
      </form>
    </div>
  );
}
