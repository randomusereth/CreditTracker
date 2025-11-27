import { useState } from 'react';
import { X, DollarSign, Save, AlertCircle } from 'lucide-react';
import { Credit, AppSettings, PaymentRecord } from '../App';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  credit: Credit;
  onUpdateCredit: (credit: Credit) => void;
  settings: AppSettings;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    recordPayment: 'Record Payment',
    credit: 'Credit',
    totalOutstanding: 'Total Outstanding',
    paymentAmount: 'Payment Amount',
    paymentAmountPlaceholder: 'Enter amount received',
    howItWorks: 'How it works',
    howItWorksText: 'This payment will be automatically distributed to unpaid and partially-paid credits, starting from the oldest first.',
    save: 'Record Payment',
    cancel: 'Cancel',
    noOutstanding: 'This credit has no outstanding balance.',
  },
  am: {
    recordPayment: 'ክፍያ መዝግብ',
    credit: 'የሆኑ እድር',
    totalOutstanding: 'ጠቅላላ ቀሪ',
    paymentAmount: 'የክፍያ መጠን',
    paymentAmountPlaceholder: 'የተቀበሉትን መጠን ያስገቡ',
    howItWorks: 'እንዴት ይሰራል',
    howItWorksText: 'ይህ ክፍያ በራስ-ሰር ከቀድሞው ጀምሮ ወደ ያልተከፈሉ እና በከፊል የተከፈሉ ብድሮች ይከፋፈላል።',
    save: 'ክፍያ መዝግብ',
    cancel: 'ሰርዝ',
    noOutstanding: 'ይህ ደንበኛ ምንም ቀሪ ሒሳብ የለውም።',
  },
};

export function RecordPaymentModal({
  isOpen,
  onClose,
  credit,
  onUpdateCredit,
  settings,
}: RecordPaymentModalProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];
  const [paymentAmount, setPaymentAmount] = useState('');

  if (!isOpen) return null;

  // Calculate total outstanding from unpaid and partially-paid credits
  const totalOutstanding = credit.remainingAmount;

  const handleSave = () => {
    const amount = parseFormattedNumber(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > totalOutstanding) {
      if (!confirm(`Payment amount (${amount.toFixed(2)} ETB) exceeds outstanding balance (${totalOutstanding.toFixed(2)} ETB). Do you want to continue?`)) {
        return;
      }
    }

    const newPaidAmount = credit.paidAmount + amount;
    const newRemainingAmount = Math.max(0, credit.totalAmount - newPaidAmount);
    
    let newStatus: 'paid' | 'unpaid' | 'partially-paid' = 'unpaid';
    if (newPaidAmount >= credit.totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially-paid';
    }

    const newPaymentRecord: PaymentRecord = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      remainingAfterPayment: newRemainingAmount,
    };

    const updatedCredit: Credit = {
      ...credit,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      paymentHistory: [...credit.paymentHistory, newPaymentRecord],
    };

    onUpdateCredit(updatedCredit);
    setPaymentAmount('');
    onClose();
  };

  const handleCancel = () => {
    setPaymentAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white">{t('recordPayment')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Credit Info */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t('credit')}</label>
            <div className="text-gray-900 dark:text-white font-medium">{credit.item}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total: {formatNumber(credit.totalAmount)} ETB</div>
          </div>

          {/* Total Outstanding */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <label className="block text-sm text-red-600 dark:text-red-400 mb-1">{t('totalOutstanding')}</label>
            <div className="text-2xl text-red-600 dark:text-red-400 font-semibold">
              {formatNumber(totalOutstanding)} ETB
            </div>
          </div>

          {totalOutstanding > 0 ? (
            <>
              {/* Payment Amount Input - Highlighted */}
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                <label htmlFor="paymentAmount" className="block text-sm text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t('paymentAmount')} *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600 dark:text-green-400" />
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={t('paymentAmountPlaceholder')}
                    step="0.01"
                    min="0"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-green-300 dark:border-green-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* How it works info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">{t('howItWorks')}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">{t('howItWorksText')}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">{t('noOutstanding')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          {totalOutstanding > 0 ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}