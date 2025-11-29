import { useState } from 'react';
import { ArrowLeft, User, Phone, DollarSign, FileText, Package, Save, ChevronDown } from 'lucide-react';
import { Credit, Customer, AppSettings } from '../types';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';
import { PaymentHistoryView } from './PaymentHistoryView';

interface EditCreditProps {
  credit: Credit;
  customer: Customer;
  allCustomers: Customer[];
  onChangeCustomer: (creditId: string, newCustomerId: string) => void;
  onUpdateCredit: (credit: Credit) => void;
  onNavigateToCustomer?: (customerId: string) => void;
  onBack: () => void;
  settings: AppSettings;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    editCredit: 'Edit Credit',
    customer: 'Customer',
    change: 'Change',
    itemLabel: 'Item/Product Sold *',
    itemPlaceholder: 'e.g., Rice 50kg, Electronics',
    remarksLabel: 'Remarks/Notes (Optional)',
    remarksPlaceholder: 'Add any additional notes...',
    totalAmountLabel: 'Total Amount (ETB) *',
    paidAmountLabel: 'Amount Paid (ETB)',
    summary: 'Summary',
    totalAmount: 'Total Amount',
    paidAmount: 'Paid Amount',
    remaining: 'Remaining',
    save: 'Save Changes',
    cancel: 'Cancel',
  },
  am: {
    editCredit: 'ብድር አርትዕ',
    customer: 'ደንበኛ',
    change: 'ቀይር',
    itemLabel: 'የተሸጠ እቃ *',
    itemPlaceholder: 'ለምሳሌ: ሩዝ 50 ኪሎ',
    remarksLabel: 'ማስታወሻ',
    remarksPlaceholder: 'ማስታወሻ ያክሉ...',
    totalAmountLabel: 'ጠቅላላ መጠን (ብር) *',
    paidAmountLabel: 'የተከፈለ መጠን (ብር)',
    summary: 'ማጠቃለያ',
    totalAmount: 'ጠቅላላ መጠን',
    paidAmount: 'የተከፈለ መጠን',
    remaining: 'ቀሪ',
    save: 'ለውጦችን አስቀምጥ',
    cancel: 'ሰርዝ',
  },
};

export function EditCredit({
  credit,
  customer,
  allCustomers,
  onChangeCustomer,
  onUpdateCredit,
  onNavigateToCustomer,
  onBack,
  settings,
}: EditCreditProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];
  const [selectedCustomerId, setSelectedCustomerId] = useState(customer.id);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({
    item: credit.item,
    remarks: credit.remarks,
    totalAmount: formatNumber(credit.totalAmount),
    paidAmount: formatNumber(credit.paidAmount),
  });

  // Removed auto-focus to prevent scrolling and keyboard opening

  const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId) || customer;

  const filteredCustomers = allCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone.includes(customerSearchTerm)
  );

  const handleCustomerChange = (newCustomerId: string) => {
    setSelectedCustomerId(newCustomerId);
    onChangeCustomer(credit.id, newCustomerId);
    setShowCustomerDropdown(false);
    setCustomerSearchTerm('');
  };

  const handleSave = () => {
    const total = parseFormattedNumber(editForm.totalAmount);
    const paid = parseFormattedNumber(editForm.paidAmount);

    if (isNaN(total) || total <= 0) {
      alert('Please enter a valid total amount');
      return;
    }

    if (isNaN(paid) || paid < 0) {
      alert('Please enter a valid paid amount');
      return;
    }

    if (paid > total) {
      alert('Paid amount cannot exceed total amount');
      return;
    }

    const remaining = total - paid;
    let status: 'paid' | 'unpaid' | 'partially-paid' = 'unpaid';
    if (paid >= total) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'partially-paid';
    }

    const updatedCredit: Credit = {
      ...credit,
      item: editForm.item,
      remarks: editForm.remarks,
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      status,
      customerId: selectedCustomerId,
    };

    onUpdateCredit(updatedCredit);
    onBack();
  };

  const calculatePreview = () => {
    const total = parseFormattedNumber(editForm.totalAmount) || 0;
    const paid = parseFormattedNumber(editForm.paidAmount) || 0;

    return {
      total,
      paid,
      remaining: total - paid,
    };
  };

  const preview = calculatePreview();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t('cancel')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-gray-900 dark:text-white text-2xl font-semibold">
          {t('editCredit')}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Customer Info */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            {t('customer')}
          </label>
          <div className="relative">
            <div 
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 cursor-pointer"
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">{selectedCustomer.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {showCustomerDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowCustomerDropdown(false)}
                />
                <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-2"
                      autoFocus
                    />
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleCustomerChange(c.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{c.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Item */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            {t('itemLabel')}
          </label>
          <input
            type="text"
            value={editForm.item}
            onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
            placeholder={t('itemPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            {t('remarksLabel')}
          </label>
          <textarea
            value={editForm.remarks}
            onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
            placeholder={t('remarksPlaceholder')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            {t('totalAmountLabel')}
          </label>
          <input
            type="text"
            value={editForm.totalAmount}
            onChange={(e) => setEditForm({ ...editForm, totalAmount: formatInputNumber(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Paid Amount */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            {t('paidAmountLabel')}
          </label>
            <input
              type="text"
              value={editForm.paidAmount}
              onChange={(e) => setEditForm({ ...editForm, paidAmount: formatInputNumber(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-3">{t('summary')}</h3>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('totalAmount')}</span>
            <span className="text-gray-900 dark:text-white">{formatNumber(preview.total)} {settings.language === 'am' ? 'ብር' : 'ETB'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('paidAmount')}</span>
            <span className="text-green-600 dark:text-green-400">{formatNumber(preview.paid)} {settings.language === 'am' ? 'ብር' : 'ETB'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('remaining')}</span>
            <span className="text-red-600 dark:text-red-400">{formatNumber(preview.remaining)} {settings.language === 'am' ? 'ብር' : 'ETB'}</span>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <PaymentHistoryView
            paymentHistory={credit.paymentHistory}
            settings={settings}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

