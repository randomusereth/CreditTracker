'use client';

/**
 * DASHBOARD CLIENT COMPONENT
 * Wrapper that connects the Dashboard component to Next.js App Context
 */

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { Dashboard } from '@/components/Dashboard';
import { Credit } from '@/types';

export function DashboardClient() {
  const router = useRouter();
  const { appState, setAppState } = useApp();

  const handleUpdateCredit = (credit: Credit) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => c.id === credit.id ? credit : c),
    }));
  };

  const handleChangeCustomer = (creditId: string, newCustomerId: string) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => 
        c.id === creditId ? { ...c, customerId: newCustomerId } : c
      ),
    }));
  };

  return (
    <Dashboard
      customers={appState.customers}
      credits={appState.credits}
      onAddCredit={() => router.push('/credits/new')}
      onViewCustomer={(id) => router.push(`/customers/${id}`)}
      settings={appState.settings}
      onUpdateCredit={handleUpdateCredit}
      onChangeCustomer={handleChangeCustomer}
      onNavigateToCustomer={(id) => router.push(`/customers/${id}`)}
    />
  );
}
