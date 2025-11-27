import { useState } from 'react';
import { Customer, Credit, AppSettings } from '../App';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import { formatNumber } from '../utils/formatNumber';

interface ReportsProps {
  credits: Credit[];
  customers: Customer[];
  settings: AppSettings;
}

export function Reports({ credits, customers, settings }: ReportsProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // Calculate statistics
  const totalCredits = credits.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalUnpaid = credits.reduce((sum, c) => sum + c.remainingAmount, 0);

  // Group credits by period
  const getCreditsGroupedByPeriod = () => {
    const grouped: Record<string, { total: number; paid: number; unpaid: number }> = {};

    credits.forEach((credit) => {
      const date = new Date(credit.date);
      let key: string;

      if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'monthly') {
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        key = date.getFullYear().toString();
      }

      if (!grouped[key]) {
        grouped[key] = { total: 0, paid: 0, unpaid: 0 };
      }

      grouped[key].total += credit.totalAmount;
      grouped[key].paid += credit.paidAmount;
      grouped[key].unpaid += credit.remainingAmount;
    });

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      ...data,
    }));
  };

  const chartData = getCreditsGroupedByPeriod();

  // Status distribution
  const statusData = [
    { name: 'Paid', value: credits.filter(c => c.status === 'paid').length, color: '#10b981' },
    { name: 'Partially Paid', value: credits.filter(c => c.status === 'partially-paid').length, color: '#f59e0b' },
    { name: 'Unpaid', value: credits.filter(c => c.status === 'unpaid').length, color: '#ef4444' },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Credit Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 58);
    
    doc.setFontSize(10);
    doc.text(`Total Credits: ${formatNumber(totalCredits)} ETB`, 20, 70);
    doc.text(`Total Paid: ${formatNumber(totalPaid)} ETB`, 20, 77);
    doc.text(`Total Unpaid: ${formatNumber(totalUnpaid)} ETB`, 20, 84);
    doc.text(`Total Customers: ${customers.length}`, 20, 91);
    doc.text(`Total Credit Records: ${credits.length}`, 20, 98);
    
    // Mobile-friendly PDF export
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const fileName = `credit_report_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
    
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your credit performance over time
            </p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300 mr-2">Period:</span>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Total Credits</p>
          <p className="text-gray-900 dark:text-white mt-1 text-2xl">{formatNumber(totalCredits)} ETB</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Total Paid</p>
          <p className="text-green-600 dark:text-green-400 mt-1 text-2xl">{formatNumber(totalPaid)} ETB</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Total Unpaid</p>
          <p className="text-red-600 dark:text-red-400 mt-1 text-2xl">{formatNumber(totalUnpaid)} ETB</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Total Records</p>
          <p className="text-gray-900 dark:text-white mt-1 text-2xl">{credits.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-gray-900 dark:text-white mb-4">Credit Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="paid" fill="#10b981" name="Paid" />
              <Bar dataKey="unpaid" fill="#ef4444" name="Unpaid" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-gray-900 dark:text-white mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}