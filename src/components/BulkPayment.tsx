import { useState, useEffect } from 'react';
import { Credit, AppSettings } from '../types';
import { DollarSign, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';

interface BulkPaymentProps {
    credits: Credit[];
    onApplyPayment: (creditUpdates: { creditId: string; newPaidAmount: number; paymentAmount: number }[]) => void;
    onClose: () => void;
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
        bulkPayment: 'ብድር መቀነሻ',
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

export function BulkPayment({ credits, onApplyPayment, onClose, settings }: BulkPaymentProps) {
    const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
            if (remainingPayment <= 0) {
                newDistribution.push({
                    creditId: credit.id,
                    credit,
                    currentRemaining: credit.remainingAmount,
                    amountToBePaid: 0,
                    newRemaining: credit.remainingAmount,
                    status: 'no-change',
                });
                continue;
            }

            const currentRemaining = credit.remainingAmount;
            const amountToBePaid = Math.min(remainingPayment, currentRemaining);
            const newRemaining = currentRemaining - amountToBePaid;

            newDistribution.push({
                creditId: credit.id,
                credit,
                currentRemaining,
                amountToBePaid,
                newRemaining,
                status: newRemaining === 0 ? 'fully-paid' : amountToBePaid > 0 ? 'partial-payment' : 'no-change',
            });

            remainingPayment -= amountToBePaid;
        }

        setDistribution(newDistribution);
    }, [paymentAmount, eligibleCredits, totalOutstanding, t]);

    const handleApplyPayment = () => {
        const amount = parseFormattedNumber(paymentAmount) || 0;

        if (amount <= 0 || amount > totalOutstanding || error) {
            return;
        }

        const updates = distribution
            .filter(d => d.amountToBePaid > 0)
            .map(d => ({
                creditId: d.creditId,
                newPaidAmount: d.credit.totalAmount - d.newRemaining,
                paymentAmount: d.amountToBePaid,
            }));

        if (updates.length > 0) {
            onApplyPayment(updates);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onClose}
                    className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={t('cancel')}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-gray-900 dark:text-white text-2xl font-semibold">
                    {t('bulkPayment')}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 16rem)' }}>
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
                                            <p className="text-red-600 dark:text-red-400">{formatNumber(totalOutstanding)} {settings.language === 'am' ? 'ብር' : 'ETB'}</p>
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
                                            {t('remaining')}: {formatNumber(totalOutstanding - (parseFormattedNumber(paymentAmount) || 0))} {settings.language === 'am' ? 'ብር' : 'ETB'}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('oldestFirst')}
                                    </p>
                                </div>

                                {/* Payment Distribution Table */}
                                {distribution.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-gray-900 dark:text-white font-semibold">{t('paymentDistribution')}</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                                        <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-400">{t('creditDate')}</th>
                                                        <th className="px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-400">{t('item')}</th>
                                                        <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{t('currentRemaining')}</th>
                                                        <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{t('willBePaid')}</th>
                                                        <th className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">{t('newRemaining')}</th>
                                                        <th className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {distribution.map((dist) => {
                                                        const statusLabels = {
                                                            'fully-paid': t('fullyPaid'),
                                                            'partial-payment': t('partialPayment'),
                                                            'no-change': t('noChange'),
                                                        };

                                                        return (
                                                            <tr key={dist.creditId} className="border-b border-gray-100 dark:border-gray-800">
                                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                                    {new Date(dist.credit.date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-900 dark:text-white text-sm">{dist.credit.item}</td>
                                                                <td className="px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                                                                    {formatNumber(dist.currentRemaining)} {settings.language === 'am' ? 'ብር' : 'ETB'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`${dist.amountToBePaid > 0
                                                                            ? 'text-green-600 dark:text-green-400 font-medium'
                                                                            : 'text-gray-400 dark:text-gray-500'
                                                                        }`}>
                                                                        {formatNumber(dist.amountToBePaid)} {settings.language === 'am' ? 'ብር' : 'ETB'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`${dist.newRemaining === 0
                                                                            ? 'text-green-600 dark:text-green-400 font-medium'
                                                                            : dist.newRemaining < dist.currentRemaining
                                                                                ? 'text-amber-600 dark:text-amber-400 font-medium'
                                                                                : 'text-red-600 dark:text-red-400'
                                                                        }`}>
                                                                        {formatNumber(dist.newRemaining)} {settings.language === 'am' ? 'ብር' : 'ETB'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${dist.status === 'fully-paid'
                                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                            : dist.status === 'partial-payment'
                                                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                        }`}>
                                                                        {statusLabels[dist.status]}
                                                                    </span>
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
        </div>
    );
}

