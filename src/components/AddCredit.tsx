import { useState } from 'react';
import { ArrowLeft, User, Package, FileText, DollarSign, Percent, UserPlus } from 'lucide-react';
import { Customer, Credit } from '../App';
import { formatNumber } from '../utils/formatNumber';

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
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !item.trim() || !totalAmount) {
      alert('Please fill in all required fields');
      return;
    }

    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    let paid = 0;
    if (paidAmount) {
      const value = parseFloat(paidAmount);
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

    const newCustomerId = onAddCustomer?.({
      name: newCustomerName,
      phone: newCustomerPhone,
      address: newCustomerAddress,
    });

    if (newCustomerId) {
      setCustomerId(newCustomerId);
      setShowNewCustomerModal(false);
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
                type="number"
                id="totalAmount"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
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
                type="number"
                id="paidAmount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
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
                  {formatNumber(parseFloat(totalAmount || '0'))} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                <span className="text-green-600 dark:text-green-400">
                  {(() => {
                    const total = parseFloat(totalAmount || '0');
                    const value = parseFloat(paidAmount || '0');
                    const paid = Math.min(value, total);
                    return formatNumber(paid);
                  })()} ETB
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-gray-700 dark:text-gray-300">Remaining:</span>
                <span className="text-red-600 dark:text-red-400">
                  {(() => {
                    const total = parseFloat(totalAmount || '0');
                    const value = parseFloat(paidAmount || '0');
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 w-96">
            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Add New Customer</h3>
            <div>
              <label htmlFor="newCustomerName" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="newCustomerName"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="newCustomerPhone" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="text"
                id="newCustomerPhone"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="Enter customer phone number"
                className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="newCustomerAddress" className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Address (Optional)
              </label>
              <input
                type="text"
                id="newCustomerAddress"
                value={newCustomerAddress}
                onChange={(e) => setNewCustomerAddress(e.target.value)}
                placeholder="Enter customer address"
                className="w-full pl-4 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
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