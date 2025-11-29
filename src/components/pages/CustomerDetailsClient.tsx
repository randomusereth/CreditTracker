'use client';

/**
 * CUSTOMER DETAILS CLIENT COMPONENT
 * Wrapper that connects the CustomerDetails component to Next.js App Context
 */

import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import { CustomerDetails } from '@/components/CustomerDetails';
import { Customer, Credit } from '@/types';

export function CustomerDetailsClient() {
  const router = useRouter();
  const params = useParams();
  const { appState, setAppState } = useApp();

  const customerId = params?.id as string;
  const customer = appState.customers.find(c => c.id === customerId);
  const credits = appState.credits.filter(c => c.customerId === customerId);

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Customer not found</p>
          <button
            onClick={() => router.push('/customers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setAppState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c),
    }));
  };

  const handleDeleteCustomer = (id: string) => {
    setAppState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      credits: prev.credits.filter(c => c.customerId !== id),
    }));
    router.push('/customers');
  };

  const handleUpdateCredit = (credit: Credit) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.map(c => c.id === credit.id ? credit : c),
    }));
  };

  const handleDeleteCredit = (id: string) => {
    setAppState(prev => ({
      ...prev,
      credits: prev.credits.filter(c => c.id !== id),
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
    <CustomerDetails
      customer={customer}
      credits={credits}
      onBack={() => router.push('/customers')}
      onAddCredit={() => router.push(`/credits/new?customerId=${customerId}`)}
      settings={appState.settings}
      onUpdateCustomer={handleUpdateCustomer}
      onDeleteCustomer={handleDeleteCustomer}
      onUpdateCredit={handleUpdateCredit}
      onDeleteCredit={handleDeleteCredit}
      allCustomers={appState.customers}
      onChangeCustomer={handleChangeCustomer}
    />
  );
}

