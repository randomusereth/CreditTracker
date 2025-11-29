import { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Save, AlertCircle } from 'lucide-react';
import { Credit, AppSettings, PaymentRecord } from '../types';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';

interface RecordPaymentProps {
  credit: Credit;
  onUpdateCredit: (credit: Credit) => void;
  onBack: () => void;
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

export function RecordPayment({
  credit,
  onUpdateCredit,
  onBack,
  settings,
}: RecordPaymentProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];
  const [paymentAmount, setPaymentAmount] = useState('');

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate total outstanding from unpaid and partially-paid credits
  const totalOutstanding = credit.remainingAmount;

  const handleSave = () => {
    const amount = parseFormattedNumber(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > totalOutstanding) {
      const currency = settings.language === 'am' ? 'ብር' : 'ETB';
      if (!confirm(`Payment amount (${amount.toFixed(2)} ${currency}) exceeds outstanding balance (${totalOutstanding.toFixed(2)} ${currency}). Do you want to continue?`)) {
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
    onBack();
  };

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
          {t('recordPayment')}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {totalOutstanding <= 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('noOutstanding')}</p>
          </div>
        ) : (
          <>
            {/* Credit Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('credit')}</span>
                <span className="text-gray-900 dark:text-white font-medium">{credit.item}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('totalOutstanding')}</span>
                <span className="text-red-600 dark:text-red-400 font-semibold text-lg">
                  {formatNumber(totalOutstanding)} {settings.language === 'am' ? 'ብር' : 'ETB'}
                </span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                {t('paymentAmount')}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(formatInputNumber(e.target.value))}
                  placeholder={t('paymentAmountPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xl"
                  autoFocus
                />
              </div>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-blue-900 dark:text-blue-300 font-semibold mb-2">{t('howItWorks')}</h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm">{t('howItWorksText')}</p>
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
                disabled={!paymentAmount || (parseFormattedNumber(paymentAmount) || 0) <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

