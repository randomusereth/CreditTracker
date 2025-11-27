import { useState } from 'react';
import { Customer, Credit, AppSettings, PaymentRecord } from '../types';
import { Plus, TrendingUp, TrendingDown, DollarSign, Users, CreditCard as CreditCardIcon, AlertCircle, Clock } from 'lucide-react';
import { CreditDetailsModal } from './CreditDetailsModal';
import { formatNumber } from '../utils/formatNumber';

interface DashboardProps {
  customers: Customer[];
  credits: Credit[];
  onAddCredit: () => void;
  onViewCustomer: (id: string) => void;
  settings: AppSettings;
  onUpdateCredit: (credit: Credit) => void;
  onChangeCustomer: (creditId: string, newCustomerId: string) => void;
  onNavigateToCustomer: (customerId: string) => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    totalCredits: 'Total Credits',
    paidCredits: 'Paid Credits',
    unpaidCredits: 'Unpaid Credits',
    customers: 'Customers',
    addCredit: 'Add Credit',
    recent: 'Recent',
    credits: 'Credits',
    viewAll: 'View All',
    customerName: 'Customer Name',
    itemSold: 'Item Sold',
    amount: 'Amount',
    status: 'Status',
    date: 'Date',
    paid: 'Paid',
    partiallyPaid: 'Partially Paid',
    noData: 'No data available',
    recentPayments: 'Recent Payments',
    paymentFor: 'Payment for',
    remainingAfter: 'Remaining After',
  },
  am: {
    dashboard: 'ዳሽቦርድ',
    totalCredits: 'ጠቅላላ ብድሮች',
    paidCredits: 'የተከፈሉ ብድሮች',
    unpaidCredits: 'ያልተከፈሉ ብድሮች',
    customers: 'ደንበኞች',
    addCredit: 'ብድር ጨምር',
    recent: 'የቅርብ ጊዜ',
    credits: 'ብድሮች',
    viewAll: 'ሁሉንም ይመልከቱ',
    customerName: 'የደንበኛ ስም',
    itemSold: 'የተሸጠ እቃ',
    amount: 'መጠን',
    status: 'ሁኔታ',
    date: 'ቀን',
    paid: 'ተከፍሏል',
    partiallyPaid: 'በከፊል የተከፈለ',
    noData: 'መረጃ የለም',
    recentPayments: 'የቅርብ ጊዜ ክፍያዎች',
    paymentFor: 'ክፍያ ለ',
    remainingAfter: 'ቀሪ በኋላ',
  },
  om: {
    dashboard: 'Daashboordii',
    totalCredits: 'Liqii Waliigalaa',
    paidCredits: 'Liqii Kaffalaame',
    unpaidCredits: 'Liqii Hin Kaffalamanee',
    customers: 'Maamiltootaa',
    addCredit: 'Liqii Ida\'i',
    recent: 'Dhiyoo',
    credits: 'Liqii',
    viewAll: 'Hunda Ilaali',
    customerName: 'Maqaa Maamilaa',
    itemSold: 'Meeshaa Gurgurtame',
    amount: 'Hamma',
    status: 'Haalata',
    date: 'Guyyaa',
    paid: 'Kaffalaame',
    partiallyPaid: 'Gartokkeen Kaffalaame',
    noData: 'Daataan hin jiru',
    recentPayments: 'Kaffaltii Dhiyoo',
    paymentFor: 'Kaffaltii',
    remainingAfter: 'Hafe Booda',
  },
};

export function Dashboard({ customers, credits, onAddCredit, onViewCustomer, settings, onUpdateCredit, onChangeCustomer, onNavigateToCustomer }: DashboardProps) {
  const t = (key: string) => translations[settings.language][key] || key;
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);

  const totalCredits = credits.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalUnpaid = credits.reduce((sum, c) => sum + c.remainingAmount, 0);
  const unpaidCount = credits.filter(c => c.status === 'unpaid' || c.status === 'partially-paid').length;

  const recentCredits = [...credits]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Show empty state for new users
  const isNewUser = customers.length === 0 && credits.length === 0;

  // Collect all payments from all credits and sort by date
  type PaymentWithContext = PaymentRecord & { credit: Credit; customerName: string };
  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };
  const allPayments: PaymentWithContext[] = [];
  credits.forEach(credit => {
    credit.paymentHistory.forEach(payment => {
      allPayments.push({
        ...payment,
        credit,
        customerName: getCustomerName(credit.customerId),
      });
    });
  });
  const recentPayments = allPayments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const stats = [
    {
      label: t('totalCredits'),
      value: `${formatNumber(totalCredits)} ETB`,
      icon: DollarSign,
      color: 'blue',
      trend: 'up',
    },
    {
      label: t('paidCredits'),
      value: `${formatNumber(totalPaid)} ETB`,
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: t('unpaidCredits'),
      value: `${formatNumber(totalUnpaid)} ETB`,
      icon: TrendingDown,
      color: 'red',
    },
    {
      label: t('customers'),
      value: customers.length.toString(),
      icon: Users,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Credit Details Modal */}
      {selectedCredit && (
        <CreditDetailsModal
          isOpen={true}
          onClose={() => setSelectedCredit(null)}
          credit={selectedCredit}
          customer={customers.find(c => c.id === selectedCredit.customerId)!}
          allCustomers={customers}
          onChangeCustomer={onChangeCustomer}
          onUpdateCredit={onUpdateCredit}
          onNavigateToCustomer={onNavigateToCustomer}
          settings={settings}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white">{t('dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your credits today.
          </p>
        </div>
        <button
          onClick={onAddCredit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('addCredit')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
            purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
          }[stat.color];

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trend && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unpaid Credits Alert */}
      {unpaidCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-900 dark:text-amber-100">
                You have {unpaidCount} {unpaidCount === 1 ? 'credit' : 'credits'} that {unpaidCount === 1 ? 'is' : 'are'} unpaid or partially paid.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for New Users */}
      {isNewUser && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4">
              <CreditCardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white mb-2">
              Welcome to Your Credit Tracker!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You're all set! Start by adding your first customer and recording credits to track payments efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onAddCredit}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Credits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-gray-900 dark:text-white">{t('recent')} {t('credits')}</h2>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('customerName')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('itemSold')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('amount')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('status')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentCredits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                recentCredits.map((credit) => (
                  <tr 
                    key={credit.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setSelectedCredit(credit)}
                  >
                    <td 
                      className="px-6 py-4 text-gray-900 dark:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCustomer(credit.customerId);
                      }}
                    >
                      <span className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer">
                        {getCustomerName(credit.customerId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {credit.item}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {formatNumber(credit.totalAmount)} ETB
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex px-2 py-1 rounded-full text-xs
                        ${credit.status === 'paid' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : credit.status === 'partially-paid'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }
                      `}>
                        {credit.status === 'paid' ? t('paid') : credit.status === 'partially-paid' ? t('partiallyPaid') : t('unpaidCredits')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(credit.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-gray-900 dark:text-white">{t('recentPayments')}</h2>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('customerName')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('paymentFor')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('amount')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('remainingAfter')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setSelectedCredit(payment.credit)}
                  >
                    <td 
                      className="px-6 py-4 text-gray-900 dark:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCustomer(payment.credit.customerId);
                      }}
                    >
                      <span className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer">
                        {payment.customerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {payment.credit.item}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {formatNumber(payment.amount)} ETB
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {formatNumber(payment.remainingAfterPayment)} ETB
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}