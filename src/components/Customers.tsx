import { useState } from 'react';
import { Customer, Credit, AppSettings } from '../App';
import { Plus, Search, Users as UsersIcon, Eye, DollarSign } from 'lucide-react';
import { formatNumber } from '../utils/formatNumber';

interface CustomersProps {
  customers: Customer[];
  credits: Credit[];
  onAddCustomer: () => void;
  onViewCustomer: (id: string) => void;
  settings?: AppSettings;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    customers: 'Customers',
    manageDatabase: 'Manage your customer database',
    addCustomer: 'Add Customer',
    searchPlaceholder: 'Search customers...',
    noCustomers: 'No customers yet. Add your first customer to get started!',
    noCustomersFound: 'No customers found',
    totalCredits: 'Total Credits',
    unpaid: 'Unpaid',
    credit: 'credit',
    credits: 'credits',
    viewDetails: 'View Details',
  },
  am: {
    customers: 'ደንበኞች',
    manageDatabase: 'የደንበኛ መረጃ ቋት ያስተዳድሩ',
    addCustomer: 'ደንበኛ ጨምር',
    searchPlaceholder: 'ደንበኞችን ይፈልጉ...',
    noCustomers: 'ገና ደንበኞች የሉም። የመጀመሪያውን ደንበኛ ለመጀመር ያክሉ!',
    noCustomersFound: 'ምንም ደንበኞች አልተገኙም',
    totalCredits: 'ጠቅላላ ብድሮች',
    unpaid: 'ያልተከፈለ',
    credit: 'ብድር',
    credits: 'ብድሮች',
    viewDetails: 'ዝርዝር ይመልከቱ',
  },
};

export function Customers({ customers, credits, onAddCustomer, onViewCustomer, settings }: CustomersProps) {
  const t = (key: string) => translations[settings?.language || 'en']?.[key] || translations['en'][key];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.replace(/\s+/g, '').includes(searchTerm.replace(/\s+/g, ''))
    );
  });

  const getCustomerStats = (customerId: string) => {
    const customerCredits = credits.filter(c => c.customerId === customerId);
    const total = customerCredits.reduce((sum, c) => sum + c.totalAmount, 0);
    const unpaid = customerCredits.reduce((sum, c) => sum + c.remainingAmount, 0);
    return { total, unpaid, count: customerCredits.length };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white">{t('customers')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('manageDatabase')}
          </p>
        </div>
        <button
          onClick={onAddCustomer}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('addCustomer')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? t('noCustomersFound') : t('noCustomers')}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const stats = getCustomerStats(customer.id);
            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-gray-900 dark:text-white mb-2">{customer.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{customer.phone}</p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('totalCredits')}</span>
                    <span className="text-gray-900 dark:text-white">{formatNumber(stats.total)} {settings.language === 'am' ? 'ብር' : 'ETB'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('unpaid')}</span>
                    <span className="text-red-600 dark:text-red-400">{formatNumber(stats.unpaid)} {settings.language === 'am' ? 'ብር' : 'ETB'}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {stats.count} {stats.count === 1 ? t('credit') : t('credits')}
                  </div>
                </div>

                <button
                  onClick={() => onViewCustomer(customer.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t('viewDetails')}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}