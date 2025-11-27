import { useState, useEffect, useRef } from 'react';
import { X, User, Phone, DollarSign, FileText, Package, Save, ChevronDown } from 'lucide-react';
import { Credit, Customer, AppSettings } from '../App';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';
import { PaymentHistoryView } from './PaymentHistoryView';

interface CreditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credit: Credit;
  customer: Customer;
  allCustomers: Customer[];
  onChangeCustomer: (creditId: string, newCustomerId: string) => void;
  onUpdateCredit: (credit: Credit) => void;
  onNavigateToCustomer?: (customerId: string) => void;
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

export function CreditDetailsModal({
  isOpen,
  onClose,
  credit,
  customer,
  allCustomers,
  onChangeCustomer,
  onUpdateCredit,
  onNavigateToCustomer,
  settings,
}: CreditDetailsModalProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];
  const paidAmountRef = useRef<HTMLInputElement>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customer.id);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({
    item: credit.item,
    remarks: credit.remarks,
    totalAmount: credit.totalAmount.toString(),
    paidAmount: credit.paidAmount.toString(),
  });

  // Auto-focus the paid amount field when modal opens
  useEffect(() => {
    if (isOpen && paidAmountRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        paidAmountRef.current?.focus();
        paidAmountRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    const totalAmount = parseFloat(editForm.totalAmount) || 0;
    const paidAmount = parseFloat(editForm.paidAmount) || 0;

    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert('Please enter a valid total amount');
      return;
    }

    if (isNaN(paidAmount) || paidAmount < 0) {
      alert('Please enter a valid paid amount');
      return;
    }

    if (paidAmount > totalAmount) {
      alert('Paid amount cannot exceed total amount');
      return;
    }

    const remainingAmount = totalAmount - paidAmount;
    let status: 'paid' | 'unpaid' | 'partially-paid' = 'unpaid';
    
    if (paidAmount >= totalAmount) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partially-paid';
    }

    const updatedCredit: Credit = {
      ...credit,
      item: editForm.item.trim(),
      remarks: editForm.remarks.trim(),
      totalAmount,
      paidAmount,
      remainingAmount,
      status,
    };

    onUpdateCredit(updatedCredit);
    onClose();
  };

  const handleCancel = () => {
    setEditForm({
      item: credit.item,
      remarks: credit.remarks,
      totalAmount: credit.totalAmount.toString(),
      paidAmount: credit.paidAmount.toString(),
    });
    onClose();
  };

  const calculatePreview = () => {
    const total = parseFloat(editForm.totalAmount) || 0;
    const paid = parseFloat(editForm.paidAmount) || 0;
    return {
      total,
      paid,
      remaining: total - paid,
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white">{t('editCredit')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Customer Info (Read-only) */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('customer')}
            </label>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div 
                  className="flex-1 cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => {
                    if (onNavigateToCustomer) {
                      onClose();
                      onNavigateToCustomer(selectedCustomer.id);
                    }
                  }}
                >
                  <p className="text-gray-900 dark:text-white font-medium">{selectedCustomer.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                  >
                    <span>{t('change')}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showCustomerDropdown && (
                    <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <input
                        type="text"
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        placeholder="Search customer..."
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 rounded-t-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCustomers.map(c => (
                          <div
                            key={c.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => handleCustomerChange(c.id)}
                          >
                            <p className="text-gray-900 dark:text-white font-medium">{c.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{c.phone}</span>
                            </div>
                          </div>
                        ))}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Item Input */}
          <div>
            <label htmlFor="item" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('itemLabel')}
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="item"
                value={editForm.item}
                onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
                placeholder={t('itemPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Total Amount Input */}
          <div>
            <label htmlFor="totalAmount" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('totalAmountLabel')}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id="totalAmount"
                value={editForm.totalAmount}
                onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Paid Amount Input */}
          <div>
            <label htmlFor="paidAmount" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('paidAmountLabel')}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id="paidAmount"
                value={editForm.paidAmount}
                onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={paidAmountRef}
              />
            </div>
          </div>

          {/* Remarks Input - Moved to bottom */}
          <div>
            <label htmlFor="remarks" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('remarksLabel')}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="remarks"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder={t('remarksPlaceholder')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment History */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <PaymentHistoryView paymentHistory={credit.paymentHistory} settings={settings} />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}