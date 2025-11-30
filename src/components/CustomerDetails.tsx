import { useState } from 'react';
import { Customer, Credit, AppSettings, PaymentRecord } from '../App';
import { ArrowLeft, Phone, MessageSquare, Download, Plus, Edit2, Trash2, X, Save, DollarSign, Wallet, Minus } from 'lucide-react';
import jsPDF from 'jspdf';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { PaymentHistoryView } from './PaymentHistoryView';
import { formatNumber } from '../utils/formatNumber';

interface CustomerDetailsProps {
  customer: Customer;
  credits: Credit[];
  onBack: () => void;
  onAddCredit: () => void;
  onBulkPayment?: () => void;
  onEditCredit?: (creditId: string) => void;
  onRecordPayment?: (creditId: string) => void;
  settings: AppSettings;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onUpdateCredit: (credit: Credit) => void;
  onDeleteCredit: (id: string) => void;
  allCustomers: Customer[];
  onChangeCustomer: (creditId: string, newCustomerId: string) => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    totalCredits: 'Total Credits',
    totalPaid: 'Total Paid',
    outstanding: 'Outstanding',
    quickActions: 'Quick Actions',
    phoneCall: 'Phone Call',
    sms: 'SMS',
    exportAll: 'Export All',
    addCredit: 'Add Credit',
    recordPayment: 'Record Payment',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    creditHistory: 'Credit History',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    filterByAmount: 'Filter by Amount',
    filterByDate: 'Filter by Date',
    filterByStatus: 'Filter by Status',
    all: 'All',
    paid: 'Paid',
    partiallyPaid: 'Partially Paid',
    unpaid: 'Unpaid',
    greaterThan: 'Greater than',
    lessThan: 'Less than',
    range: 'Range',
    from: 'From',
    to: 'To',
    startDate: 'Start Date',
    endDate: 'End Date',
    date: 'Date',
    itemSold: 'Item Sold',
    total: 'Total',
    paidAmount: 'Paid',
    remaining: 'Remaining',
    status: 'Status',
    remarks: 'Remarks',
    actions: 'Actions',
    noCredits: 'No credit records yet',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    customer: 'customer',
    credit: 'credit',
    editCustomerModal: 'Edit Customer',
    customerName: 'Customer Name',
    phoneNumber: 'Phone Number',
    noOutstanding: 'You have no outstanding credits. Thank you!',
    totalOutstanding: 'Total Outstanding',
    etb: 'ETB',
    unpaidTab: 'Unpaid',
    paidTab: 'Paid',
    noUnpaidCredits: 'No unpaid credits',
  },
  am: {
    totalCredits: 'ጠቅላላ ብድሮች',
    totalPaid: 'የተከፈለ',
    outstanding: 'ቀሪ',
    quickActions: 'ፈጣን እርምጃዎች',
    phoneCall: 'ስልክ ደውል',
    sms: 'ኤስ ኤም ኤስ',
    exportAll: 'ሁሉንም ላክ',
    addCredit: 'ብድር ጨምር',
    recordPayment: 'ብድር ቀንስ',
    editCustomer: 'ደንበኛ አርትዕ',
    deleteCustomer: 'ደንበኛ ሰርዝ',
    creditHistory: 'የብድር ታሪክ',
    filters: 'ማጣሪያዎች',
    clearFilters: 'ማጣሪያዎችን አጽዳ',
    filterByAmount: 'በመጠን ያጣሩ',
    filterByDate: 'በቀን ያጣሩ',
    filterByStatus: 'በሁኔታ ያጣሩ',
    all: 'ሁሉም',
    paid: 'ተከፍሏል',
    partiallyPaid: 'በከፊል የተከፈለ',
    unpaid: 'ያልተከፈለ',
    greaterThan: 'ከዚህ በላይ',
    lessThan: 'ከዚህ በታች',
    range: 'ክልል',
    from: 'ከ',
    to: 'እስከ',
    startDate: 'መጀመሪያ ቀን',
    endDate: 'መጨረሻ ቀን',
    date: 'ቀን',
    itemSold: 'የተሸጠ እቃ',
    total: 'ጠቅላላ',
    paidAmount: 'የተከፈለ',
    remaining: 'ቀሪ',
    status: 'ሁኔታ',
    remarks: 'ማስታወሻ',
    actions: 'እርምጃዎች',
    noCredits: 'ገና የብድር መዝገቦች የሉም',
    delete: 'ሰርዝ',
    save: 'አስቀምጥ',
    cancel: 'ሰርዝ',
    customer: 'ደንበኛ',
    credit: 'ብድር',
    editCustomerModal: 'ደንበኛ አርትዕ',
    customerName: 'የደንበኛ ስም',
    phoneNumber: 'ስልክ ቁጥር',
    noOutstanding: 'ያልተከፈለ ብድር የለቦትም እናመሰግናለን',
    totalOutstanding: 'ያልተከፈል ብር መጠን',
    etb: 'ብር',
    unpaidTab: 'ያልተከፈለ',
    paidTab: 'የተከፈለ',
    noUnpaidCredits: 'ያልተከፈለ ብድር የለም',
  },
};

export function CustomerDetails({
  customer,
  credits,
  onBack,
  onAddCredit,
  onBulkPayment,
  onEditCredit,
  onRecordPayment,
  settings,
  onUpdateCustomer,
  onDeleteCustomer,
  onUpdateCredit,
  onDeleteCredit,
  allCustomers,
  onChangeCustomer
}: CustomerDetailsProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];

  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: customer.name, phone: customer.phone });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'customer' | 'credit'; id: string; name?: string }>({ isOpen: false, type: 'credit', id: '' });

  // Calculate key metrics from all credits (independent of tab)
  const totalCredits = credits.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalUnpaid = credits.reduce((sum, c) => sum + c.remainingAmount, 0);

  // Filter by tab (unpaid or paid) - only affects the table display
  const filteredCredits = credits.filter((credit) => {
    if (activeTab === 'unpaid') {
      // Show unpaid and partially-paid credits (remainingAmount > 0)
      return credit.remainingAmount > 0;
    } else {
      // Show paid credits (remainingAmount === 0)
      return credit.remainingAmount === 0;
    }
  });


  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Credit History', 20, 20);
    doc.setFontSize(12);
    doc.text(`Customer: ${customer.name}`, 20, 35);
    doc.text(`Phone: ${customer.phone}`, 20, 42);
    doc.setFontSize(10);
    let yPos = 58;
    doc.text(`Total Credits: ${totalCredits.toFixed(2)} ETB`, 20, yPos);
    doc.text(`Total Paid: ${totalPaid.toFixed(2)} ETB`, 20, yPos + 7);
    doc.text(`Outstanding: ${totalUnpaid.toFixed(2)} ETB`, 20, yPos + 14);
    yPos += 28;
    doc.setFontSize(9);
    doc.text('Date', 20, yPos);
    doc.text('Item', 50, yPos);
    doc.text('Total', 110, yPos);
    doc.text('Paid', 140, yPos);
    doc.text('Remaining', 170, yPos);
    yPos += 7;
    filteredCredits.forEach((credit) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(new Date(credit.date).toLocaleDateString(), 20, yPos);
      doc.text(credit.item.substring(0, 20), 50, yPos);
      doc.text(`${credit.totalAmount.toFixed(2)}`, 110, yPos);
      doc.text(`${credit.paidAmount.toFixed(2)}`, 140, yPos);
      doc.text(`${credit.remainingAmount.toFixed(2)}`, 170, yPos);
      yPos += 7;
    });

    // Mobile-friendly PDF export
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileName = `${customer.name.replace(/\s+/g, '_')}_credits.pdf`;

    // Try to use download attribute (works on desktop)
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);

    // For mobile, also try opening in new window as fallback
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setTimeout(() => {
        window.open(pdfUrl, '_blank');
      }, 500);
    }
  };

  const handleUpdateCustomer = () => {
    onUpdateCustomer({ ...customer, ...customerForm });
    setEditingCustomer(false);
  };

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => {
          if (deleteModal.type === 'customer') {
            onDeleteCustomer(deleteModal.id);
            onBack();
          } else {
            onDeleteCredit(deleteModal.id);
          }
        }}
        itemType={deleteModal.type}
        itemName={deleteModal.name}
        settings={settings}
      />



      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-gray-900 dark:text-white">{customer.name}</h1>
          <div className="text-gray-600 dark:text-gray-400 mt-1">
            <span>{customer.phone}</span>
          </div>
        </div>
        <button
          onClick={() => setEditingCustomer(true)}
          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          title={t('editCustomer')}
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setDeleteModal({ isOpen: true, type: 'customer', id: customer.id, name: customer.name })}
          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          title={t('deleteCustomer')}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white">{t('editCustomerModal')}</h2>
              <button onClick={() => setEditingCustomer(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('customerName')}</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateCustomer}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t('save')}
                </button>
                <button
                  onClick={() => setEditingCustomer(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around">
            <div className="flex-1 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('outstanding')}</p>
              <p className="text-red-600 dark:text-red-400 mt-1 text-xl">{formatNumber(totalUnpaid)} {settings.language === 'am' ? 'ብር' : 'ETB'}</p>
            </div>
            <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex-1 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('totalPaid')}</p>
              <p className="text-green-600 dark:text-green-400 mt-1 text-xl">{formatNumber(totalPaid)} {settings.language === 'am' ? 'ብር' : 'ETB'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-gray-900 dark:text-white mb-4">{t('quickActions')}</h2>
        <div className="space-y-3">
          <button
            onClick={onAddCredit}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('addCredit')}
          </button>
          <button
            onClick={() => {
              if (onBulkPayment) {
                onBulkPayment();
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Minus className="w-5 h-5" />
            {t('recordPayment')}
          </button>
          <button
            onClick={() => window.location.href = `tel:${customer.phone}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            {t('phoneCall')}
          </button>
        </div>
      </div>

      {/* Credit History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-gray-900 dark:text-white">{t('creditHistory')}</h2>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`w-full px-4 py-2 font-medium transition-colors rounded-lg ${activeTab === 'unpaid'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('unpaidTab')}
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`w-full px-4 py-2 font-medium transition-colors rounded-lg ${activeTab === 'paid'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {t('paidTab')}
            </button>
          </div>

        </div>

        <div className="overflow-x-auto">
          {activeTab === 'unpaid' && filteredCredits.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noUnpaidCredits')}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('date')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('itemSold')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('total')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('paidAmount')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('remaining')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('status')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('remarks')}</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCredits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">{t('noCredits')}</td>
                  </tr>
                ) : (
                  filteredCredits.map((credit) => (
                    <tr
                      key={credit.id}
                      onClick={() => onEditCredit && onEditCredit(credit.id)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(credit.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{credit.item}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{formatNumber(credit.totalAmount)} {settings.language === 'am' ? 'ብር' : 'ETB'}</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">{formatNumber(credit.paidAmount)} {settings.language === 'am' ? 'ብር' : 'ETB'}</td>
                      <td className="px-6 py-4 text-red-600 dark:text-red-400">{formatNumber(credit.remainingAmount)} {settings.language === 'am' ? 'ብር' : 'ETB'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${credit.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : credit.status === 'partially-paid' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {t(credit.status === 'paid' ? 'paid' : credit.status === 'partially-paid' ? 'partiallyPaid' : 'unpaid')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{credit.remarks || '-'}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {onEditCredit && (
                            <button onClick={() => onEditCredit(credit.id)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Edit Credit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onRecordPayment && (
                            <button onClick={() => onRecordPayment(credit.id)} className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Record Payment">
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setDeleteModal({ isOpen: true, type: 'credit', id: credit.id, name: credit.item })} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title={t('delete')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment History for this customer */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <PaymentHistoryView
          paymentHistory={credits.flatMap(credit =>
            credit.paymentHistory.map(payment => ({
              ...payment,
              note: `${payment.note ? payment.note + ' - ' : ''}${credit.item}`
            }))
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          settings={settings}
        />
      </div>
    </div>
  );
}