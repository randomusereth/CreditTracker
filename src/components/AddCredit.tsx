import { useState } from 'react';
import { ArrowLeft, User, Package, FileText, DollarSign, Percent, UserPlus, AlertCircle, Phone, X } from 'lucide-react';
import { Customer, Credit } from '../App';
import { formatNumber, formatInputNumber, parseFormattedNumber } from '../utils/formatNumber';
import { validateEthiopianPhone } from '../utils/phoneValidation';

type AddCreditProps = {
  customers: Customer[];
  preselectedCustomerId?: string | null;
  onAddCredit: (credit: Omit<Credit, 'id' | 'date' | 'status'>) => void;
  onCancel: () => void;
  onAddCustomer?: (customer: Omit<Customer, 'id' | 'createdAt'>) => string; // Returns new customer ID
};

export default function AddCredit({ customers, preselectedCustomerId, onAddCredit, onCancel, onAddCustomer }: AddCreditProps) {
  const [customerId, setCustomerId] = useState(preselectedCustomerId || '');
  const [item, setItem] = useState('');
  const [remarks, setRemarks] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !item.trim() || !totalAmount) {
      alert('Please fill in all required fields');
      return;
    }

    const total = parseFormattedNumber(totalAmount);
    if (isNaN(total) || total <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    let paid = 0;
    if (paidAmount) {
      const value = parseFormattedNumber(paidAmount);
      if (!isNaN(value) && value >= 0) {
        paid = Math.min(value, total);
      }
    }

    onAddCredit({
      customerId,
      item: item.trim(),
      remarks: remarks.trim(),
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: total - paid,
      images: [],
    });
  };

  const handleAddNewCustomer = () => {
    if (!newCustomerName || !newCustomerPhone) {
      alert('Please fill in the customer name and phone number');
      return;
    }

    // Validate phone number
    const phoneValidation = validateEthiopianPhone(newCustomerPhone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Invalid phone number');
      return;
    }

    setPhoneError(null);

    const newCustomerId = onAddCustomer?.({
      name: newCustomerName,
      phone: newCustomerPhone.trim(),
    });

    if (newCustomerId) {
      setCustomerId(newCustomerId);
      setShowNewCustomerModal(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    }
  };

  const handlePhoneChange = (value: string) => {
    setNewCustomerPhone(value);
    if (phoneError) {
      const validation = validateEthiopianPhone(value);
      if (validation.isValid) {
        setPhoneError(null);
      } else {
        setPhoneError(validation.error || null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-gray-900 dark:text-white">Add New Credit</h2>
          <p className="text-gray-600 dark:text-gray-400">Record a credit transaction</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Customer Select */}
          <div>
            <label htmlFor="customer" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Select Customer *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="">Choose a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowNewCustomerModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add New Customer
            </button>
          </div>

          {/* Item Input */}
          <div>
            <label htmlFor="item" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Item/Product Sold *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g., Rice 50kg, Electronics"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Total Amount Input */}
          <div>
            <label htmlFor="totalAmount" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Total Amount (ETB) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                id="totalAmount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(formatInputNumber(e.target.value))}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Amount Paid Input - Highlighted */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <label htmlFor="paidAmount" className="block text-sm text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount Paid (ETB)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-blue-400" />
              <input
                type="text"
                inputMode="numeric"
                id="paidAmount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(formatInputNumber(e.target.value))}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Enter the amount already paid by the customer</p>
          </div>

          {/* Remarks Input - Moved to bottom */}
          <div>
            <label htmlFor="remarks" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Remarks/Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {totalAmount && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-gray-900 dark:text-white mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatNumber(parseFormattedNumber(totalAmount || '0'))} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                <span className="text-green-600 dark:text-green-400">
                  {(() => {
                    const total = parseFormattedNumber(totalAmount || '0');
                    const value = parseFormattedNumber(paidAmount || '0');
                    const paid = Math.min(value, total);
                    return formatNumber(paid);
                  })()} ETB
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-gray-700 dark:text-gray-300">Remaining:</span>
                <span className="text-red-600 dark:text-red-400">
                  {(() => {
                    const total = parseFormattedNumber(totalAmount || '0');
                    const value = parseFormattedNumber(paidAmount || '0');
                    const paid = Math.min(value, total);
                    return formatNumber(total - paid);
                  })()} ETB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Credit
          </button>
        </div>
      </form>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Add New Customer</h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="newCustomerName" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="newCustomerName"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newCustomerPhone" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="newCustomerPhone"
                    value={newCustomerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+251912345678 or 0912345678"
                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border ${
                      phoneError ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                    } rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                {phoneError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{phoneError}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Only Ethiopian phone numbers allowed (+251 or 0...)
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewCustomer}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}