import { useState, useEffect } from 'react';
import { Credit, AppSettings } from '../App';
import { X, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';

interface BulkPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: Credit[];
  onApplyPayment: (creditUpdates: { creditId: string; newPaidAmount: number; paymentAmount: number }[]) => void;
  settings: AppSettings;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    bulkPayment: 'Bulk Payment',
    enterAmount: 'Enter Payment Amount',
    totalOutstanding: 'Total Outstanding',
    remaining: 'Remaining',
    paymentDistribution: 'Payment Distribution',
    creditDate: 'Credit Date',
    item: 'Item',
    currentRemaining: 'Current Remaining',
    willBePaid: 'Will Be Paid',
    newRemaining: 'New Remaining',
    fullyPaid: 'Fully Paid',
    partialPayment: 'Partial Payment',
    noChange: 'No Change',
    applyPayment: 'Apply Payment',
    cancel: 'Cancel',
    noUnpaidCredits: 'No unpaid or partially paid credits',
    paymentTooHigh: 'Payment amount cannot exceed total outstanding',
    enterValidAmount: 'Please enter a valid payment amount',
    oldestFirst: 'Payments will be applied to oldest credits first',
  },
  am: {
    bulkPayment: 'ጅምላ ክፍያ',
    enterAmount: 'የክፍያ መጠን ያስገቡ',
    totalOutstanding: 'ጠቅላላ ቀሪ',
    remaining: 'ቀሪ',
    paymentDistribution: 'የክፍያ ስርጭት',
    creditDate: 'የብድር ቀን',
    item: 'እቃ',
    currentRemaining: 'አሁን ያለው ቀሪ',
    willBePaid: 'የሚከፈል',
    newRemaining: 'አዲስ ቀሪ',
    fullyPaid: 'ሙሉ በሙሉ ተከፍሏል',
    partialPayment: 'የከፊል ክፍያ',
    noChange: 'ምንም ለውጥ የለም',
    applyPayment: 'ክፍያ ተግብር',
    cancel: 'ሰርዝ',
    noUnpaidCredits: 'ያልተከፈለ ወይም በከፊል የተከፈለ ብድር የለም',
    paymentTooHigh: 'የክፍያ መጠን ከጠቅላላ ቀሪ ሊበልጥ አይችልም',
    enterValidAmount: 'እባክዎ የሚሰራ የክፍያ መጠን ያስገቡ',
    oldestFirst: 'ክፍያዎች በመጀመሪያ ለድሮ ብድሮች ይተገበራሉ',
  },
};

interface PaymentDistribution {
  creditId: string;
  credit: Credit;
  currentRemaining: number;
  amountToBePaid: number;
  newRemaining: number;
  status: 'fully-paid' | 'partial-payment' | 'no-change';
}

export function BulkPaymentModal({ isOpen, onClose, credits, onApplyPayment, settings }: BulkPaymentModalProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];

  // Filter and sort credits: only unpaid and partially-paid, sorted by date (oldest first)
  const eligibleCredits = credits
    .filter(c => c.status === 'unpaid' || c.status === 'partially-paid')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalOutstanding = eligibleCredits.reduce((sum, c) => sum + c.remainingAmount, 0);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [distribution, setDistribution] = useState<PaymentDistribution[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const amount = parseFormattedNumber(paymentAmount) || 0;
    
    if (amount < 0) {
      setError(t('enterValidAmount'));
      setDistribution([]);
      return;
    }

    if (amount > totalOutstanding) {
      setError(t('paymentTooHigh'));
    } else {
      setError('');
    }

    // Calculate distribution
    let remainingPayment = amount;
    const newDistribution: PaymentDistribution[] = [];

    for (const credit of eligibleCredits) {
      const currentRemaining = credit.remainingAmount;
      let amountToBePaid = 0;
      let status: 'fully-paid' | 'partial-payment' | 'no-change' = 'no-change';

      if (remainingPayment > 0) {
        if (remainingPayment >= currentRemaining) {
          // Fully pay this credit
          amountToBePaid = currentRemaining;
          remainingPayment -= currentRemaining;
          status = 'fully-paid';
        } else {
          // Partially pay this credit
          amountToBePaid = remainingPayment;
          remainingPayment = 0;
          status = 'partial-payment';
        }
      }

      newDistribution.push({
        creditId: credit.id,
        credit,
        currentRemaining,
        amountToBePaid,
        newRemaining: currentRemaining - amountToBePaid,
        status,
      });
    }

    setDistribution(newDistribution);
  }, [paymentAmount, eligibleCredits.length, totalOutstanding]);

  const handleApplyPayment = () => {
    const amount = parseFormattedNumber(paymentAmount) || 0;
    
    if (amount <= 0) {
      setError(t('enterValidAmount'));
      return;
    }

    if (amount > totalOutstanding) {
      setError(t('paymentTooHigh'));
      return;
    }

    // Create updates for all affected credits
    const updates = distribution
      .filter(d => d.amountToBePaid > 0)
      .map(d => ({
        creditId: d.creditId,
        newPaidAmount: d.credit.paidAmount + d.amountToBePaid,
        paymentAmount: d.amountToBePaid,
      }));

    onApplyPayment(updates);
    onClose();
    setPaymentAmount('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white">{t('bulkPayment')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {eligibleCredits.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t('noUnpaidCredits')}
            </div>
          ) : (
            <>
              {/* Payment Amount Input */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">
                    {t('enterAmount')}
                  </label>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalOutstanding')}</p>
                    <p className="text-red-600 dark:text-red-400">{formatNumber(totalOutstanding)} ETB</p>
                  </div>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(formatInputNumber(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xl"
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                {!error && paymentAmount && parseFormattedNumber(paymentAmount) > 0 && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t('remaining')}: {formatNumber(totalOutstanding - (parseFormattedNumber(paymentAmount) || 0))} ETB
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {t('oldestFirst')}
                </p>
              </div>

              {/* Payment Distribution */}
              {eligibleCredits.length > 0 && (
                <div>
                  <h3 className="text-gray-900 dark:text-white mb-4">{t('paymentDistribution')}</h3>
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">#</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">{t('creditDate')}</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">{t('item')}</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">{t('currentRemaining')}</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">{t('willBePaid')}</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">{t('newRemaining')}</th>
                          <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm">{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {eligibleCredits.map((credit, index) => {
                          const dist = distribution.find(d => d.creditId === credit.id);
                          const currentRemaining = credit.remainingAmount;
                          const amountToBePaid = dist?.amountToBePaid || 0;
                          const newRemaining = dist?.newRemaining ?? currentRemaining;
                          const status = dist?.status || 'no-change';

                          return (
                            <tr
                              key={credit.id}
                              className={`${
                                status === 'fully-paid'
                                  ? 'bg-green-50 dark:bg-green-900/20'
                                  : status === 'partial-payment'
                                  ? 'bg-amber-50 dark:bg-amber-900/20'
                                  : 'bg-white dark:bg-gray-800'
                              }`}
                            >
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{index + 1}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                {new Date(credit.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-gray-900 dark:text-white text-sm">{credit.item}</td>
                              <td className="px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                                {formatNumber(currentRemaining)} ETB
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`${
                                  amountToBePaid > 0
                                    ? 'text-green-600 dark:text-green-400 font-medium'
                                    : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                  {formatNumber(amountToBePaid)} ETB
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`${
                                  newRemaining === 0
                                    ? 'text-green-600 dark:text-green-400 font-medium'
                                    : newRemaining < currentRemaining
                                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatNumber(newRemaining)} ETB
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {status === 'fully-paid' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    {t('fullyPaid')}
                                  </span>
                                )}
                                {status === 'partial-payment' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs">
                                    {t('partialPayment')}
                                  </span>
                                )}
                                {status === 'no-change' && (
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    {t('noChange')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {eligibleCredits.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleApplyPayment}
              disabled={!paymentAmount || (parseFormattedNumber(paymentAmount) || 0) <= 0 || !!error}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('applyPayment')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}