'use client';

/**
 * CUSTOMERS CLIENT COMPONENT
 * Wrapper that connects the Customers component to Next.js App Context
 */

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { Customers } from '@/components/Customers';

export function CustomersClient() {
  const router = useRouter();
  const { appState } = useApp();

  return (
    <Customers
      customers={appState.customers}
      credits={appState.credits}
      onAddCustomer={() => router.push('/customers/new')}
      onViewCustomer={(id) => router.push(`/customers/${id}`)}
      settings={appState.settings}
    />
  );
}

