import { Clock, DollarSign } from 'lucide-react';
import { PaymentRecord, AppSettings } from '../App';
import { formatNumber } from '../utils/formatNumber';

interface PaymentHistoryViewProps {
  paymentHistory: PaymentRecord[];
  settings: AppSettings;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    paymentHistory: 'Payment History',
    noPayments: 'No payments recorded yet',
    paymentOn: 'Payment on',
    remainingAfter: 'Remaining After',
    note: 'Note',
  },
  am: {
    paymentHistory: 'የክፍያ ታሪክ',
    noPayments: 'ገና ምንም ክፍያ አልተመዘገበም',
    paymentOn: 'ክፍያ በ',
    remainingAfter: 'ቀሪ በኋላ',
    note: 'ማስታወሻ',
  },
};

export function PaymentHistoryView({ paymentHistory, settings }: PaymentHistoryViewProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];

  if (paymentHistory.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-8 text-center">
        <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">{t('noPayments')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-gray-900 dark:text-white mb-4">{t('paymentHistory')}</h3>
      <div className="space-y-3">
        {paymentHistory.map((payment, index) => (
          <div
            key={payment.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">{formatNumber(payment.amount)} {settings.language === 'am' ? 'ብር' : 'ETB'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{t('paymentOn')} {new Date(payment.date).toLocaleString()}</span>
                </div>
                {payment.note && (
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1">
                    <span className="text-gray-500 dark:text-gray-400">{t('note')}:</span> {payment.note}
                  </div>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('remainingAfter')}</p>
                <p className={`font-medium ${
                  payment.remainingAfterPayment === 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatNumber(payment.remainingAfterPayment)} {settings.language === 'am' ? 'ብር' : 'ETB'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
