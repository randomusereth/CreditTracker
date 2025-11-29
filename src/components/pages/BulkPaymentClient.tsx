'use client';

/**
 * BULK PAYMENT CLIENT COMPONENT
 * Wrapper that connects the BulkPayment component to Next.js App Context
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { BulkPayment } from '@/components/BulkPayment';
import { Credit } from '@/types';
import { ArrowLeft } from 'lucide-react';

export function BulkPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { appState, setAppState } = useApp();

  // Get customer ID from query params if available
  const customerId = searchParams.get('customerId');

  // Filter credits based on customerId if provided
  let credits = appState.credits.filter(c => c.status === 'unpaid' || c.status === 'partially-paid');
  
  if (customerId) {
    credits = credits.filter(c => c.customerId === customerId);
  }

  const handleApplyPayment = (creditUpdates: { creditId: string; newPaidAmount: number; paymentAmount: number }[]) => {
    // Update credits in app state
    setAppState(prev => {
      const updatedCredits = prev.credits.map(credit => {
        const update = creditUpdates.find(u => u.creditId === credit.id);
        if (update && update.paymentAmount > 0) {
          const newPaymentRecord = {
            id: Date.now().toString() + Math.random(),
            amount: update.paymentAmount,
            date: new Date().toISOString(),
            remainingAfterPayment: credit.totalAmount - update.newPaidAmount,
            note: '',
          };

          return {
            ...credit,
            paidAmount: update.newPaidAmount,
            remainingAmount: credit.totalAmount - update.newPaidAmount,
            status: update.newPaidAmount >= credit.totalAmount
              ? 'paid' as const
              : update.newPaidAmount > 0
                ? 'partially-paid' as const
                : 'unpaid' as const,
            paymentHistory: [...credit.paymentHistory, newPaymentRecord],
          };
        }
        return credit;
      });

      return {
        ...prev,
        credits: updatedCredits,
      };
    });

    // Navigate back
    if (customerId) {
      router.push('/customers');
    } else {
      router.push('/');
    }
  };

  const handleClose = () => {
    if (customerId) {
      router.push('/customers');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-gray-900 dark:text-white text-2xl font-semibold">
          {appState.settings.language === 'am' ? 'ጅምላ ክፍያ' : 'Bulk Payment'}
        </h1>
      </div>
      <BulkPayment
        credits={credits}
        onApplyPayment={handleApplyPayment}
        onClose={handleClose}
        settings={appState.settings}
      />
    </div>
  );
}

