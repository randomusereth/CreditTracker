import { Customer, Credit, ShopInfo, Staff, AppSettings } from '../App';

/**
 * LOCAL DATABASE
 * This simulates a database with sample data.
 * In production, this would be replaced with a real database (Supabase, Firebase, etc.)
 */

// Sample Customers Data
export const customersData: Customer[] = [
  { 
    id: '1', 
    name: 'Abebe Kebede', 
    phone: '+251911234567', 
    createdAt: '2024-01-15T10:00:00Z' 
  },
  { 
    id: '2', 
    name: 'Tigist Alemayehu', 
    phone: '+251922345678', 
    createdAt: '2024-01-20T14:30:00Z' 
  },
  { 
    id: '3', 
    name: 'Mulugeta Haile', 
    phone: '+251933456789', 
    createdAt: '2024-02-05T09:15:00Z' 
  },
  { 
    id: '4', 
    name: 'Sara Mohammed', 
    phone: '+251944567890', 
    createdAt: '2024-02-10T11:20:00Z' 
  },
  { 
    id: '5', 
    name: 'Dawit Tesfaye', 
    phone: '+251955678901', 
    createdAt: '2024-02-15T16:45:00Z' 
  },
  { 
    id: '6', 
    name: 'Almaz Bekele', 
    phone: '+251966789012', 
    createdAt: '2024-03-01T08:30:00Z' 
  },
  { 
    id: '7', 
    name: 'Yohannes Tadesse', 
    phone: '+251977890123', 
    createdAt: '2024-03-05T13:15:00Z' 
  },
  { 
    id: '8', 
    name: 'Hanna Wolde', 
    phone: '+251988901234', 
    createdAt: '2024-03-10T10:45:00Z' 
  },
];

// Sample Credits Data with Payment History
export const creditsData: Credit[] = [
  { 
    id: '1', 
    customerId: '1', 
    item: 'Sugar 50kg', 
    remarks: 'First purchase', 
    totalAmount: 5000, 
    paidAmount: 5000, 
    remainingAmount: 0, 
    images: [], 
    date: '2024-01-15T10:00:00Z', 
    status: 'paid',
    paymentHistory: [
      { 
        id: 'p1', 
        amount: 5000, 
        date: '2024-01-15T10:00:00Z', 
        remainingAfterPayment: 0, 
        note: 'Paid in full' 
      }
    ] 
  },
  { 
    id: '2', 
    customerId: '1', 
    item: 'Rice 25kg', 
    remarks: '', 
    totalAmount: 2500, 
    paidAmount: 1500, 
    remainingAmount: 1000, 
    images: [], 
    date: '2024-02-20T14:30:00Z', 
    status: 'partially-paid',
    paymentHistory: [
      { 
        id: 'p2', 
        amount: 1000, 
        date: '2024-02-20T14:30:00Z', 
        remainingAfterPayment: 1500, 
        note: 'Initial payment' 
      },
      { 
        id: 'p3', 
        amount: 500, 
        date: '2024-02-25T09:00:00Z', 
        remainingAfterPayment: 1000, 
        note: 'Second payment' 
      }
    ] 
  },
  { 
    id: '3', 
    customerId: '2', 
    item: 'Flour 100kg', 
    remarks: 'Bulk order', 
    totalAmount: 8000, 
    paidAmount: 0, 
    remainingAmount: 8000, 
    images: [], 
    date: '2024-02-25T09:15:00Z', 
    status: 'unpaid',
    paymentHistory: [] 
  },
  { 
    id: '4', 
    customerId: '2', 
    item: 'Cooking Oil 20L', 
    remarks: '', 
    totalAmount: 3500, 
    paidAmount: 3500, 
    remainingAmount: 0, 
    images: [], 
    date: '2024-03-01T11:20:00Z', 
    status: 'paid',
    paymentHistory: [
      { 
        id: 'p4', 
        amount: 2000, 
        date: '2024-03-01T11:20:00Z', 
        remainingAfterPayment: 1500, 
        note: 'First installment' 
      },
      { 
        id: 'p5', 
        amount: 1500, 
        date: '2024-03-08T14:30:00Z', 
        remainingAfterPayment: 0, 
        note: 'Final payment' 
      }
    ] 
  },
  { 
    id: '5', 
    customerId: '3', 
    item: 'Coffee 10kg', 
    remarks: 'Premium quality', 
    totalAmount: 4500, 
    paidAmount: 2000, 
    remainingAmount: 2500, 
    images: [], 
    date: '2024-03-05T16:45:00Z', 
    status: 'partially-paid',
    paymentHistory: [
      { 
        id: 'p6', 
        amount: 1000, 
        date: '2024-03-05T16:45:00Z', 
        remainingAfterPayment: 3500 
      },
      { 
        id: 'p7', 
        amount: 1000, 
        date: '2024-03-12T10:00:00Z', 
        remainingAfterPayment: 2500 
      }
    ] 
  },
  { 
    id: '6', 
    customerId: '3', 
    item: 'Tea 5kg', 
    remarks: '', 
    totalAmount: 1500, 
    paidAmount: 0, 
    remainingAmount: 1500, 
    images: [], 
    date: '2024-03-10T10:00:00Z', 
    status: 'unpaid',
    paymentHistory: [] 
  },
  { 
    id: '7', 
    customerId: '4', 
    item: 'Pasta 50 boxes', 
    remarks: '', 
    totalAmount: 6000, 
    paidAmount: 6000, 
    remainingAmount: 0, 
    images: [], 
    date: '2024-03-15T14:30:00Z', 
    status: 'paid',
    paymentHistory: [
      { 
        id: 'p8', 
        amount: 3000, 
        date: '2024-03-15T14:30:00Z', 
        remainingAfterPayment: 3000 
      },
      { 
        id: 'p9', 
        amount: 2000, 
        date: '2024-03-20T09:00:00Z', 
        remainingAfterPayment: 1000 
      },
      { 
        id: 'p10', 
        amount: 1000, 
        date: '2024-03-25T11:00:00Z', 
        remainingAfterPayment: 0 
      }
    ] 
  },
  { 
    id: '8', 
    customerId: '4', 
    item: 'Tomato Paste 24 cans', 
    remarks: 'Regular customer', 
    totalAmount: 1200, 
    paidAmount: 600, 
    remainingAmount: 600, 
    images: [], 
    date: '2024-03-20T09:15:00Z', 
    status: 'partially-paid',
    paymentHistory: [
      { 
        id: 'p11', 
        amount: 600, 
        date: '2024-03-20T09:15:00Z', 
        remainingAfterPayment: 600 
      }
    ] 
  },
  { 
    id: '9', 
    customerId: '5', 
    item: 'Milk Powder 10kg', 
    remarks: '', 
    totalAmount: 7500, 
    paidAmount: 0, 
    remainingAmount: 7500, 
    images: [], 
    date: '2024-03-25T11:20:00Z', 
    status: 'unpaid',
    paymentHistory: [] 
  },
  { 
    id: '10', 
    customerId: '5', 
    item: 'Washing Powder 5kg', 
    remarks: '', 
    totalAmount: 2000, 
    paidAmount: 2000, 
    remainingAmount: 0, 
    images: [], 
    date: '2024-03-28T16:45:00Z', 
    status: 'paid',
    paymentHistory: [
      { 
        id: 'p12', 
        amount: 2000, 
        date: '2024-03-28T16:45:00Z', 
        remainingAfterPayment: 0 
      }
    ] 
  },
  { 
    id: '11', 
    customerId: '1', 
    item: 'Soap Bars 100pcs', 
    remarks: '', 
    totalAmount: 1800, 
    paidAmount: 900, 
    remainingAmount: 900, 
    images: [], 
    date: '2024-04-02T10:00:00Z', 
    status: 'partially-paid',
    paymentHistory: [
      { 
        id: 'p13', 
        amount: 900, 
        date: '2024-04-02T10:00:00Z', 
        remainingAfterPayment: 900 
      }
    ] 
  },
  { 
    id: '12', 
    customerId: '2', 
    item: 'Salt 25kg', 
    remarks: '', 
    totalAmount: 800, 
    paidAmount: 0, 
    remainingAmount: 800, 
    images: [], 
    date: '2024-04-05T14:30:00Z', 
    status: 'unpaid',
    paymentHistory: [] 
  },
  { 
    id: '13', 
    customerId: '6', 
    item: 'Wheat 50kg', 
    remarks: 'Good quality', 
    totalAmount: 3200, 
    paidAmount: 1600, 
    remainingAmount: 1600, 
    images: [], 
    date: '2024-04-08T09:30:00Z', 
    status: 'partially-paid',
    paymentHistory: [
      { 
        id: 'p14', 
        amount: 1600, 
        date: '2024-04-08T09:30:00Z', 
        remainingAfterPayment: 1600,
        note: 'Half payment' 
      }
    ] 
  },
  { 
    id: '14', 
    customerId: '7', 
    item: 'Barley 30kg', 
    remarks: '', 
    totalAmount: 2400, 
    paidAmount: 0, 
    remainingAmount: 2400, 
    images: [], 
    date: '2024-04-10T14:00:00Z', 
    status: 'unpaid',
    paymentHistory: [] 
  },
  { 
    id: '15', 
    customerId: '8', 
    item: 'Lentils 20kg', 
    remarks: 'Red lentils', 
    totalAmount: 1800, 
    paidAmount: 1800, 
    remainingAmount: 0, 
    images: [], 
    date: '2024-04-12T11:15:00Z', 
    status: 'paid',
    paymentHistory: [
      { 
        id: 'p15', 
        amount: 1800, 
        date: '2024-04-12T11:15:00Z', 
        remainingAfterPayment: 0,
        note: 'Cash payment' 
      }
    ] 
  },
];

// Sample Shop Info
export const shopInfoData: ShopInfo = {
  name: 'Addis Mart',
  region: 'Addis Ababa',
  city: 'Bole',
  phone: '+251911000000',
  email: 'info@addismart.com',
};

// Sample Staff Data
export const staffData: Staff[] = [
  {
    id: '1',
    name: 'Lemlem Assefa',
    role: 'Manager',
    permissions: {
      viewReports: true,
      addCredit: true,
      manageCustomers: true,
    },
  },
  {
    id: '2',
    name: 'Getachew Mamo',
    role: 'Cashier',
    permissions: {
      viewReports: false,
      addCredit: true,
      manageCustomers: false,
    },
  },
  {
    id: '3',
    name: 'Bethlehem Desta',
    role: 'Sales Assistant',
    permissions: {
      viewReports: false,
      addCredit: true,
      manageCustomers: false,
    },
  },
];

// Settings Data
export const settingsData: AppSettings = {
  theme: 'dark',
  language: 'en',
  calendarType: 'gregorian',
};
