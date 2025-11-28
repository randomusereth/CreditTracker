import { useState } from 'react';
import { Customer, Credit, AppSettings } from '../App';
import { Search, Filter, X, CreditCard as CreditCardIcon, Download } from 'lucide-react';
import { CreditDetailsModal } from './CreditDetailsModal';
import { formatNumber } from '../utils/formatNumber';
import jsPDF from 'jspdf';
import { getCurrentUser } from '../lib/auth';
import { getTelegramUserId } from '../lib/auth';

interface AllCreditsProps {
  credits: Credit[];
  customers: Customer[];
  settings: AppSettings;
  onUpdateCredit: (credit: Credit) => void;
  onChangeCustomer: (creditId: string, newCustomerId: string) => void;
  onNavigateToCustomer: (customerId: string) => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    allCredits: 'All Credits',
    searchPlaceholder: 'Search by customer name, phone, or item...',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    filterByAmount: 'Filter by Amount',
    greaterThan: 'Greater than',
    lessThan: 'Less than',
    range: 'Range',
    from: 'From',
    to: 'To',
    filterByDate: 'Filter by Date',
    startDate: 'Start Date',
    endDate: 'End Date',
    customerName: 'Customer Name',
    phone: 'Phone',
    item: 'Item',
    totalAmount: 'Total Amount',
    paidAmount: 'Paid',
    remaining: 'Remaining',
    status: 'Status',
    date: 'Date',
    remarks: 'Remarks',
    noCredits: 'No credits found',
    paid: 'Paid',
    partiallyPaid: 'Partially Paid',
    unpaid: 'Unpaid',
    exportPDF: 'Export PDF',
  },
  am: {
    allCredits: 'ሁሉም ብድሮች',
    searchPlaceholder: 'በደንበኛ ስም፣ ስልክ ወይም እቃ ይፈልጉ...',
    filters: 'ማጣሪያዎች',
    clearFilters: 'ማጣሪያዎችን አጽዳ',
    filterByAmount: 'በመጠን ያጣሩ',
    greaterThan: 'ከዚህ በላይ',
    lessThan: 'ከዚህ በታች',
    range: 'ክልል',
    from: 'ከ',
    to: 'እስከ',
    filterByDate: 'በቀን ያጣሩ',
    startDate: 'መጀመሪያ ቀን',
    endDate: 'መጨረሻ ቀን',
    customerName: 'የደንበኛ ስም',
    phone: 'ስልክ',
    item: 'እቃ',
    totalAmount: 'ጠቅላላ መጠን',
    paidAmount: 'የተከፈለ',
    remaining: 'ቀሪ',
    status: 'ሁኔታ',
    date: 'ቀን',
    remarks: 'ማስታወሻ',
    noCredits: 'ምንም ብድሮች አልተገኙም',
    paid: 'ተከፍሏል',
    partiallyPaid: 'በከፊል የተከፈለ',
    unpaid: 'ያልተከፈለ',
    exportPDF: 'PDF ላይ ላክ',
  },
};

export function AllCredits({ credits, customers, settings, onUpdateCredit, onChangeCustomer, onNavigateToCustomer }: AllCreditsProps) {
  const t = (key: string) => translations[settings.language]?.[key] || translations['en'][key];

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [amountFilter, setAmountFilter] = useState<'none' | 'gt' | 'lt' | 'range'>('none');
  const [amountValue, setAmountValue] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);

  const getCustomerInfo = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  const filteredCredits = credits.filter((credit) => {
    const customer = getCustomerInfo(credit.customerId);

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = customer?.name.toLowerCase().includes(search);
      const matchesPhone = customer?.phone.toLowerCase().includes(search);
      const matchesItem = credit.item.toLowerCase().includes(search);

      if (!matchesName && !matchesPhone && !matchesItem) {
        return false;
      }
    }

    // Amount filter
    if (amountFilter !== 'none') {
      if (amountFilter === 'gt' && amountValue) {
        if (credit.totalAmount <= parseFloat(amountValue)) return false;
      }
      if (amountFilter === 'lt' && amountValue) {
        if (credit.totalAmount >= parseFloat(amountValue)) return false;
      }
      if (amountFilter === 'range' && amountFrom && amountTo) {
        const amount = credit.totalAmount;
        if (amount < parseFloat(amountFrom) || amount > parseFloat(amountTo)) return false;
      }
    }

    // Date filter
    if (dateFilterType === 'single' && singleDate) {
      const creditDate = new Date(credit.date);
      const filterDate = new Date(singleDate);
      // Check if same day
      if (creditDate.toDateString() !== filterDate.toDateString()) return false;
    } else if (dateFilterType === 'range' && (startDate || endDate)) {
      const creditDate = new Date(credit.date);
      if (startDate && new Date(startDate) > creditDate) return false;
      if (endDate && new Date(endDate) < creditDate) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setAmountFilter('none');
    setAmountValue('');
    setAmountFrom('');
    setAmountTo('');
    setSingleDate('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const hasActiveFilters = amountFilter !== 'none' || singleDate || (dateFilterType === 'range' && (startDate || endDate)) || searchTerm;

  const handleSendPDFViaBot = async () => {
    try {
      const user = getCurrentUser();
      const telegramUserId = getTelegramUserId();

      if (!user || !telegramUserId) {
        alert(settings.language === 'am' 
          ? 'እባክዎ በመጀመሪያ ይግቡ' 
          : 'Please log in first');
        return;
      }

      // Show loading message
      const loadingMessage = settings.language === 'am' 
        ? 'PDF እየተጠናቀቀ ነው... እባክዎ ይጠብቁ' 
        : 'Generating PDF... Please wait';
      
      // You could show a toast/notification here
      console.log(loadingMessage);

      // Call API to generate and send PDF via bot
      const response = await fetch('/api/credits/send-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          telegramUserId: telegramUserId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        const successMessage = settings.language === 'am'
          ? '✅ PDF በቦት ውስጥ ተልኳል! እባክዎ ቦት ውስጥ ይመልከቱ'
          : '✅ PDF sent to bot! Please check your Telegram chat';
        alert(successMessage);
      } else {
        throw new Error(result.error || 'Failed to send PDF');
      }
    } catch (error) {
      console.error('Error sending PDF via bot:', error);
      const errorMessage = settings.language === 'am'
        ? '❌ PDF ላክ አልቻለም. እባክዎ ይሞክሩ'
        : '❌ Failed to send PDF. Please try again';
      alert(errorMessage);
    }
  };

  const handleDownloadPDF = () => {
    // Generate PDF on client side
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    const lineHeight = 7;
    const maxY = pageHeight - margin;

    // Helper function to add a new page if needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > maxY) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('All Credits Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Export date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const totalCreditsAmount = filteredCredits.reduce((sum, c) => sum + c.totalAmount, 0);
    const totalPaidAmount = filteredCredits.reduce((sum, c) => sum + c.paidAmount, 0);
    const totalRemainingAmount = filteredCredits.reduce((sum, c) => sum + c.remainingAmount, 0);

    doc.text(`Total Credits: ${filteredCredits.length}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Amount: ${formatNumber(totalCreditsAmount)} ETB`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Paid: ${formatNumber(totalPaidAmount)} ETB`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Total Remaining: ${formatNumber(totalRemainingAmount)} ETB`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Table header
    checkNewPage(lineHeight * 2);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Credits Details', margin, yPosition);
    yPosition += lineHeight * 1.5;

    // Table columns
    const colWidths = [35, 30, 35, 25, 25, 25, 20];
    const headers = ['Customer', 'Phone', 'Item', 'Total', 'Paid', 'Remaining', 'Status'];
    let xPosition = margin;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += lineHeight;

    // Draw line under header
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += lineHeight * 0.5;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    filteredCredits.forEach((credit, index) => {
      checkNewPage(lineHeight * 2);

      const customer = getCustomerInfo(credit.customerId);
      const customerName = customer?.name || 'Unknown';
      const phone = customer?.phone || '-';
      const item = credit.item.length > 20 ? credit.item.substring(0, 20) + '...' : credit.item;
      const total = formatNumber(credit.totalAmount);
      const paid = formatNumber(credit.paidAmount);
      const remaining = formatNumber(credit.remainingAmount);
      const status = credit.status === 'paid' ? 'Paid' : credit.status === 'partially-paid' ? 'Partial' : 'Unpaid';

      xPosition = margin;
      const rowData = [customerName, phone, item, total, paid, remaining, status];

      rowData.forEach((data, colIndex) => {
        // Truncate text if too long
        let text = String(data);
        if (colIndex === 0 && text.length > 15) text = text.substring(0, 15) + '...';
        if (colIndex === 2 && text.length > 20) text = text.substring(0, 20) + '...';

        doc.text(text, xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });

      yPosition += lineHeight;

      // Add separator line every 5 rows
      if ((index + 1) % 5 === 0 && index < filteredCredits.length - 1) {
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += lineHeight * 0.5;
      }
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Generate PDF as blob and force download
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileName = `all_credits_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Also open in new tab for viewing
    setTimeout(() => {
      window.open(pdfUrl, '_blank');
    }, 100);
    
    // Clean up
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Credit Details Modal */}
      {selectedCredit && (
        <CreditDetailsModal
          isOpen={true}
          onClose={() => setSelectedCredit(null)}
          credit={selectedCredit}
          customer={getCustomerInfo(selectedCredit.customerId)!}
          allCustomers={customers}
          onChangeCustomer={onChangeCustomer}
          onUpdateCredit={onUpdateCredit}
          onNavigateToCustomer={onNavigateToCustomer}
          settings={settings}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <CreditCardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">{t('allCredits')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredCredits.length} of {credits.length} credits
            </p>
          </div>
        </div>
        <button
          onClick={handleSendPDFViaBot}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('exportPDF')}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Search */}
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

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {t('filters')}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              {t('clearFilters')}
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            {/* Amount Filter */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('filterByAmount')}</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAmountFilter('none')}
                    className={`px-3 py-1 rounded-lg text-sm ${amountFilter === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAmountFilter('gt')}
                    className={`px-3 py-1 rounded-lg text-sm ${amountFilter === 'gt'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {t('greaterThan')}
                  </button>
                  <button
                    onClick={() => setAmountFilter('lt')}
                    className={`px-3 py-1 rounded-lg text-sm ${amountFilter === 'lt'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {t('lessThan')}
                  </button>
                  <button
                    onClick={() => setAmountFilter('range')}
                    className={`px-3 py-1 rounded-lg text-sm ${amountFilter === 'range'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {t('range')}
                  </button>
                </div>

                {(amountFilter === 'gt' || amountFilter === 'lt') && (
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                )}

                {amountFilter === 'range' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder={t('from')}
                      value={amountFrom}
                      onChange={(e) => setAmountFrom(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder={t('to')}
                      value={amountTo}
                      onChange={(e) => setAmountTo(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('filterByDate')}</label>
              <div className="mb-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDateFilterType('single')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateFilterType === 'single'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    Single Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilterType('range')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${dateFilterType === 'range'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    Date Range
                  </button>
                </div>
              </div>
              {dateFilterType === 'single' ? (
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('startDate')}</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('endDate')}</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Credits Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('customerName')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('phone')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('item')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('totalAmount')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('paidAmount')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('remaining')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('status')}</th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCredits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('noCredits')}
                  </td>
                </tr>
              ) : (
                filteredCredits.map((credit) => {
                  const customer = getCustomerInfo(credit.customerId);
                  return (
                    <tr
                      key={credit.id}
                      onClick={() => setSelectedCredit(credit)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td
                        className="px-6 py-4 text-gray-900 dark:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (customer) onNavigateToCustomer(customer.id);
                        }}
                      >
                        <span className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer">
                          {customer?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {customer?.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {credit.item}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {formatNumber(credit.totalAmount)} ETB
                      </td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">
                        {formatNumber(credit.paidAmount)} ETB
                      </td>
                      <td className="px-6 py-4 text-red-600 dark:text-red-400">
                        {formatNumber(credit.remainingAmount)} ETB
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
                          {credit.status === 'paid' ? t('paid') : credit.status === 'partially-paid' ? t('partiallyPaid') : t('unpaid')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(credit.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}