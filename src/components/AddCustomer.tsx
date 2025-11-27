import { useState } from 'react';
import { ArrowLeft, User, Phone, Upload, AlertCircle } from 'lucide-react';
import { Customer } from '../App';
import { validateEthiopianPhone } from '../utils/phoneValidation';
import { ContactPickerModal } from './ContactPickerModal';

type AddCustomerProps = {
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
};

export default function AddCustomer({ onAddCustomer, onCancel }: AddCustomerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showContactPicker, setShowContactPicker] = useState(false);

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
      alert('Please fill in all fields');
      return;
    }

    // Validate phone number
    const phoneValidation = validateEthiopianPhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Invalid phone number');
      return;
    }

    setPhoneError(null);
    onAddCustomer({ name: name.trim(), phone: phone.trim() });
  };

  const handleImportFromContacts = () => {
    setShowContactPicker(true);
  };

  const handleSelectContact = (contactName: string, contactPhone: string) => {
    setName(contactName);
    setPhone(contactPhone);
    setPhoneError(null);
    setShowContactPicker(false);
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
          <h2 className="text-gray-900 dark:text-white">Add New Customer</h2>
          <p className="text-gray-600 dark:text-gray-400">Enter customer details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Customer Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+251912345678 or 0912345678"
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
              Only Ethiopian phone numbers allowed (+251 or 0...)
            </p>
          </div>
        </div>

        {/* Import from Contacts */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <button
            type="button"
            onClick={handleImportFromContacts}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Upload className="w-5 h-5" />
            <span>Import from Phone Contacts</span>
          </button>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            Quickly add customers from your phone's contact list
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Customer
          </button>
        </div>
      </form>

      {/* Contact Picker Modal */}
      <ContactPickerModal
        isOpen={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
}
